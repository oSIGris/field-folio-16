import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AidCampaign = Database["public"]["Tables"]["aid_campaigns"]["Row"];
export type AidType = Database["public"]["Tables"]["aid_types"]["Row"];
export type AidApplication = Database["public"]["Tables"]["aid_applications"]["Row"];
export type AidApplicationStatus =
  Database["public"]["Enums"]["aid_application_status"];

export const AID_STATUSES: { value: AidApplicationStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "falta_documentacion", label: "Falta documentación" },
  { value: "presentado", label: "Presentado" },
  { value: "subsanacion", label: "Subsanación" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "finalizado", label: "Finalizado" },
];

export function aidStatusLabel(status: AidApplicationStatus) {
  return AID_STATUSES.find((s) => s.value === status)?.label ?? status;
}

// ---------------- Campaigns ----------------
export function useAidCampaigns(cooperativeId: string, includeArchived = false) {
  return useQuery({
    queryKey: ["aid_campaigns", cooperativeId, includeArchived],
    enabled: !!cooperativeId,
    staleTime: 60_000,
    queryFn: async (): Promise<AidCampaign[]> => {
      let q = supabase
        .from("aid_campaigns")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .order("year", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
      if (!includeArchived) q = q.is("archived_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveCampaign(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      name: string;
      year: number | null;
      starts_on: string | null;
      ends_on: string | null;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("aid_campaigns")
          .update({
            name: input.name,
            year: input.year,
            starts_on: input.starts_on,
            ends_on: input.ends_on,
          })
          .eq("id", input.id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("aid_campaigns").insert({
          cooperative_id: cooperativeId,
          created_by: userId,
          name: input.name,
          year: input.year,
          starts_on: input.starts_on,
          ends_on: input.ends_on,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aid_campaigns", cooperativeId] }),
  });
}

export function useArchiveCampaign(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("aid_campaigns")
        .update({
          archived_at: archived ? new Date().toISOString() : null,
          archived_by: archived ? userId : null,
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aid_campaigns", cooperativeId] }),
  });
}

// ---------------- Aid types ----------------
export function useAidTypes(cooperativeId: string, includeArchived = false) {
  return useQuery({
    queryKey: ["aid_types", cooperativeId, includeArchived],
    enabled: !!cooperativeId,
    staleTime: 60_000,
    queryFn: async (): Promise<AidType[]> => {
      let q = supabase
        .from("aid_types")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (!includeArchived) q = q.is("archived_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveAidType(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      code: string | null;
      name: string;
      description: string | null;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from("aid_types")
          .update({
            code: input.code,
            name: input.name,
            description: input.description,
          })
          .eq("id", input.id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("aid_types").insert({
          cooperative_id: cooperativeId,
          created_by: userId,
          code: input.code,
          name: input.name,
          description: input.description,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aid_types", cooperativeId] }),
  });
}

export function useArchiveAidType(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("aid_types")
        .update({
          archived_at: archived ? new Date().toISOString() : null,
          archived_by: archived ? userId : null,
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["aid_types", cooperativeId] }),
  });
}

// ---------------- Applications (expedientes) ----------------
export function useSocioApplications(cooperativeId: string, socioId?: string) {
  return useQuery({
    queryKey: ["aid_applications", cooperativeId, socioId],
    enabled: !!cooperativeId && !!socioId,
    staleTime: 30_000,
    queryFn: async (): Promise<AidApplication[]> => {
      const { data, error } = await supabase
        .from("aid_applications")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .eq("socio_id", socioId!)
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateApplication(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      socio_id: string;
      campaign_id: string | null;
      aid_type_id: string | null;
      title: string | null;
      status: AidApplicationStatus;
      due_date: string | null;
      notes: string | null;
    }) => {
      const { error } = await supabase.from("aid_applications").insert({
        cooperative_id: cooperativeId,
        created_by: userId,
        updated_by: userId,
        ...input,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["aid_applications", cooperativeId, v.socio_id],
      }),
  });
}

export function useUpdateApplication(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      socio_id: string;
      patch: Partial<
        Pick<
          AidApplication,
          | "campaign_id"
          | "aid_type_id"
          | "title"
          | "status"
          | "due_date"
          | "notes"
          | "submitted_at"
          | "resolved_at"
        >
      >;
    }) => {
      const { error } = await supabase
        .from("aid_applications")
        .update({ ...input.patch, updated_by: userId })
        .eq("id", input.id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["aid_applications", cooperativeId, v.socio_id],
      }),
  });
}

export function useArchiveApplication(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      socio_id,
    }: {
      id: string;
      socio_id: string;
    }) => {
      const { error } = await supabase
        .from("aid_applications")
        .update({
          archived_at: new Date().toISOString(),
          archived_by: userId,
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["aid_applications", cooperativeId, v.socio_id],
      }),
  });
}