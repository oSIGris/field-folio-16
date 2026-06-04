import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Proposal {
  kind: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
}

const SYSTEM_PROMPT = `Eres el copiloto IA de un ERP para cooperativas agrícolas españolas.
Ayudas a técnicos y tramitadores con: socios agricultores, expedientes de ayudas/subvenciones,
documentación pendiente, fechas límite y tareas administrativas.

Reglas estrictas:
- Eres un asistente SEGURO: propones, NUNCA ejecutas acciones.
- No inventes datos concretos de socios o expedientes que no conozcas.
- Responde en español, claro y conciso, con tono administrativo.

Devuelve SIEMPRE un JSON válido con esta forma exacta:
{
  "answer": "texto de respuesta para el técnico",
  "proposals": [
    {
      "kind": "create_task | create_email_draft | create_automation | review",
      "title": "título corto de la propuesta",
      "description": "qué haría esta propuesta",
      "payload": { }
    }
  ]
}
Si no procede ninguna propuesta, devuelve "proposals": [].`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "No autenticado" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // Identify the caller with their JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Sesión no válida" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const cooperativeId: string | undefined = body.cooperative_id;
    const message: string | undefined = body.message;
    let conversationId: string | null = body.conversation_id ?? null;

    if (!cooperativeId || !message || !message.trim()) {
      return json({ error: "Faltan cooperative_id o message" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Authorize: caller must be admin/gestor of the cooperative.
    const { data: membership } = await admin
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("cooperative_id", cooperativeId)
      .maybeSingle();
    if (!membership || !["admin", "gestor"].includes(membership.role)) {
      return json({ error: "Sin permisos en esta cooperativa" }, 403);
    }

    // Ensure a conversation exists and belongs to this user + cooperative.
    if (conversationId) {
      const { data: conv } = await admin
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .eq("cooperative_id", cooperativeId)
        .maybeSingle();
      if (!conv) conversationId = null;
    }
    if (!conversationId) {
      const { data: created, error: convErr } = await admin
        .from("ai_conversations")
        .insert({
          cooperative_id: cooperativeId,
          user_id: user.id,
          title: message.slice(0, 60),
        })
        .select("id")
        .single();
      if (convErr || !created) {
        return json({ error: "No se pudo crear la conversación" }, 500);
      }
      conversationId = created.id;
    }

    // Persist the user message.
    await admin.from("ai_messages").insert({
      conversation_id: conversationId,
      cooperative_id: cooperativeId,
      role: "user",
      content: message,
    });

    // Load short history for context.
    const { data: history } = await admin
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    let answer = "";
    let proposals: Proposal[] = [];

    if (!openaiKey) {
      answer =
        "El copiloto no está configurado todavía. Falta el secreto OPENAI_API_KEY en las funciones de Supabase.";
    } else {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(history ?? []).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const txt = await aiRes.text();
        console.error("OpenAI error", aiRes.status, txt);
        return json(
          { error: "El servicio de IA devolvió un error", detail: aiRes.status },
          502,
        );
      }

      const aiJson = await aiRes.json();
      const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
      try {
        const parsed = JSON.parse(raw);
        answer = typeof parsed.answer === "string" ? parsed.answer : raw;
        if (Array.isArray(parsed.proposals)) {
          proposals = parsed.proposals
            .filter((p: Proposal) => p && p.title)
            .slice(0, 6);
        }
      } catch {
        answer = raw;
      }
    }

    // Persist assistant message.
    const { data: assistantMsg } = await admin
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        cooperative_id: cooperativeId,
        role: "assistant",
        content: answer,
      })
      .select("id")
      .single();

    // Persist proposals as pending (never executed automatically).
    let savedProposals: unknown[] = [];
    if (proposals.length > 0) {
      const { data: inserted } = await admin
        .from("ai_action_proposals")
        .insert(
          proposals.map((p) => ({
            cooperative_id: cooperativeId,
            conversation_id: conversationId,
            message_id: assistantMsg?.id ?? null,
            kind: p.kind || "review",
            title: p.title,
            description: p.description ?? null,
            payload: p.payload ?? {},
            status: "pending",
          })),
        )
        .select("*");
      savedProposals = inserted ?? [];
    }

    await admin
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return json({
      conversation_id: conversationId,
      answer,
      proposals: savedProposals,
    });
  } catch (e) {
    console.error("erp-ai-assistant error", e);
    return json({ error: (e as Error).message ?? "Error interno" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}