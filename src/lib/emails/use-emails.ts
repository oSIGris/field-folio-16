import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EmailDraft = Database["public"]["Tables"]["email_drafts"]["Row"];
export type EmailDraftStatus =
  Database["public"]["Enums"]["email_draft_status"];

export const EMAIL_STATUSES: { value: EmailDraftStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "pending_approval", label: "Pendiente aprobación" },
  { value: "approved", label: "Aprobado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "sent", label: "Enviado" },
];

export function emailStatusLabel(s: EmailDraftStatus) {
  return EMAIL_STATUSES.find((x) => x.value === s)?.label ?? s;
}

export interface EmailDraftInput {
  id?: string;
  recipient: string | null;
  subject: string;
  body: string;
  socio_id: string | null;
  task_id: string | null;
  status: EmailDraftStatus;
}

export function useEmailDrafts(cooperativeId: string) {
  return useQuery({
    queryKey: ["email_drafts", cooperativeId],
    enabled: !!cooperativeId,
    staleTime: 20_000,
    queryFn: async (): Promise<EmailDraft[]> => {
      const { data, error } = await supabase
        .from("email_drafts")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveEmailDraft(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EmailDraftInput) => {
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase
          .from("email_drafts")
          .update({ ...patch, updated_by: userId })
          .eq("id", id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { id: _omit, ...rest } = input;
        const { error } = await supabase.from("email_drafts").insert({
          ...rest,
          cooperative_id: cooperativeId,
          created_by: userId,
          updated_by: userId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["email_drafts", cooperativeId] }),
  });
}

export function useSetDraftStatus(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: EmailDraftStatus;
    }) => {
      const { error } = await supabase
        .from("email_drafts")
        .update({ status, updated_by: userId })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["email_drafts", cooperativeId] }),
  });
}