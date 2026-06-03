import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Socio } from "./socios-fields";

type SocioUpdate = Partial<Socio>;

export function sociosQueryKey(cooperativeId: string) {
  return ["socios", cooperativeId] as const;
}

export function useSocios(cooperativeId: string) {
  return useQuery({
    queryKey: sociosQueryKey(cooperativeId),
    enabled: !!cooperativeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<Socio[]> => {
      const { data, error } = await supabase
        .from("socios")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .is("deleted_at", null)
        .order("nif_cif", { ascending: true, nullsFirst: false })
        .order("nombre", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveSocios(cooperativeId: string, userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (edits: Record<string, SocioUpdate>) => {
      const entries = Object.entries(edits);
      for (const [id, patch] of entries) {
        const payload: SocioUpdate = userId ? { ...patch, updated_by: userId } : patch;
        const { error } = await supabase
          .from("socios")
          .update(payload)
          .eq("id", id)
          .eq("cooperative_id", cooperativeId)
          .is("deleted_at", null);
        if (error) throw error;
      }
      return entries.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sociosQueryKey(cooperativeId) });
    },
  });
}

export function useCreateSocio(cooperativeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: string | { userId: string; values?: Partial<Socio> },
    ): Promise<Socio> => {
      const userId = typeof input === "string" ? input : input.userId;
      const values = typeof input === "string" ? undefined : input.values;
      const { data, error } = await supabase
        .from("socios")
        .insert({
          cooperative_id: cooperativeId,
          created_by: userId,
          updated_by: userId,
          activo: true,
          alta: true,
          baja: false,
          subvencion: false,
          traspaso: false,
          finaliza: false,
          registra: false,
          cuaderno: false,
          ayudas_borras: false,
          ...values,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sociosQueryKey(cooperativeId) });
    },
  });
}

export function useDeleteSocios(cooperativeId: string, userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const payload: SocioUpdate = {
        deleted_at: new Date().toISOString(),
        ...(userId ? { updated_by: userId } : {}),
      };
      const { error } = await supabase
        .from("socios")
        .update(payload)
        .in("id", ids)
        .eq("cooperative_id", cooperativeId)
        .is("deleted_at", null);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sociosQueryKey(cooperativeId) });
    },
  });
}
