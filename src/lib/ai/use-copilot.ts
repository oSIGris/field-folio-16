import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AiProposal =
  Database["public"]["Tables"]["ai_action_proposals"]["Row"];
export type AiProposalStatus =
  Database["public"]["Enums"]["ai_proposal_status"];

export interface CopilotResponse {
  conversation_id: string;
  answer: string;
  proposals: AiProposal[];
}

/**
 * Calls the secure Supabase Edge Function `erp-ai-assistant`.
 * The frontend never talks to OpenAI directly.
 */
export function useAskCopilot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      cooperative_id: string;
      conversation_id?: string | null;
      message: string;
    }): Promise<CopilotResponse> => {
      const { data, error } = await supabase.functions.invoke(
        "erp-ai-assistant",
        { body: input },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as CopilotResponse;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["ai_proposals", v.cooperative_id] });
    },
  });
}

export function useProposals(cooperativeId: string) {
  return useQuery({
    queryKey: ["ai_proposals", cooperativeId],
    enabled: !!cooperativeId,
    staleTime: 15_000,
    queryFn: async (): Promise<AiProposal[]> => {
      const { data, error } = await supabase
        .from("ai_action_proposals")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDecideProposal(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Extract<AiProposalStatus, "accepted" | "rejected">;
    }) => {
      // Accepting does NOT execute the action yet — it only records the decision.
      const { error } = await supabase
        .from("ai_action_proposals")
        .update({
          status,
          decided_by: userId,
          decided_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["ai_proposals", cooperativeId] }),
  });
}