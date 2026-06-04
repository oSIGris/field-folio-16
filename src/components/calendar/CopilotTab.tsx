import { useState } from "react";
import { Send, Bot, Check, X, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useAskCopilot,
  useDecideProposal,
  useProposals,
  type AiProposal,
} from "@/lib/ai/use-copilot";
import { PROPOSAL_TONE } from "./tones";

const SUGGESTIONS = [
  "Crea una propuesta para avisar de expedientes sin documentación.",
  "Redacta un correo para pedir documentación pendiente.",
  "Resume qué tareas debería revisar hoy.",
  "Propón una automatización para fecha_aviso.",
];

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export function CopilotTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const ask = useAskCopilot();
  const decide = useDecideProposal(cooperativeId, userId);
  const { data: proposals = [] } = useProposals(cooperativeId);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  const pendingProposals = proposals.filter((p) => p.status === "pending");

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setTurns((t) => [...t, { role: "user", content: msg }]);
    setMessage("");
    try {
      const res = await ask.mutateAsync({
        cooperative_id: cooperativeId,
        conversation_id: conversationId,
        message: msg,
      });
      setConversationId(res.conversation_id);
      setTurns((t) => [...t, { role: "assistant", content: res.answer }]);
    } catch (e) {
      toast.error("El copiloto no respondió", {
        description: (e as Error).message,
      });
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content:
            "No se pudo contactar con el copiloto. Revisa que la función erp-ai-assistant esté configurada con OPENAI_API_KEY.",
        },
      ]);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="flex min-h-[420px] flex-col rounded-md border bg-card">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          Copiloto seguro: propone, no ejecuta. La IA corre en el servidor.
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {turns.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Pregunta algo para empezar:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => send(s)}
                    className="rounded-full border px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {turns.map((t, i) => (
            <div
              key={i}
              className={cn("flex gap-2", t.role === "user" && "justify-end")}
            >
              {t.role === "assistant" && (
                <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              )}
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                  t.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {t.content}
              </div>
            </div>
          ))}
          {ask.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
            </div>
          )}
        </div>
        <div className="border-t p-2">
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              disabled={!canEdit}
              placeholder={
                canEdit ? "Escribe una pregunta…" : "Solo lectura"
              }
              className="min-h-10 resize-none"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(message);
                }
              }}
            />
            <Button
              size="icon"
              disabled={!canEdit || ask.isPending || !message.trim()}
              onClick={() => send(message)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Propuestas</h3>
        {pendingProposals.length === 0 && (
          <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
            Las propuestas del copiloto aparecerán aquí para aceptar o rechazar.
          </p>
        )}
        {proposals.slice(0, 12).map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            canEdit={canEdit}
            onDecide={(status) =>
              decide.mutate({ id: p.id, status })
            }
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  canEdit,
  onDecide,
}: {
  proposal: AiProposal;
  canEdit: boolean;
  onDecide: (status: "accepted" | "rejected") => void;
}) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {proposal.title}
        </span>
        <Badge className={cn("h-5 px-1.5", PROPOSAL_TONE[proposal.status])}>
          {proposal.status}
        </Badge>
      </div>
      {proposal.description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {proposal.description}
        </p>
      )}
      {canEdit && proposal.status === "pending" && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            className="h-7"
            onClick={() => onDecide("accepted")}
          >
            <Check className="mr-1 h-3.5 w-3.5" /> Aceptar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => onDecide("rejected")}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}