import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Socio } from "./socios-fields";

type SocioUpdate = Database["public"]["Tables"]["socios"]["Update"];

export function sociosQueryKey(cooperativeId: string) {
  return ["socios", cooperativeId] as const;
}

export function useSocios(cooperativeId: string) {
  return useQuery({
    queryKey: sociosQueryKey(cooperativeId),
    enabled: !!cooperativeId,
    queryFn: async (): Promise<Socio[]> => {
      const { data, error } = await supabase
        .from("socios")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .order("codigo_socio", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveSocios(cooperativeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (edits: Record<string, SocioUpdate>) => {
      const entries = Object.entries(edits);
      for (const [id, patch] of entries) {
        const { error } = await supabase
          .from("socios")
          .update(patch)
          .eq("id", id)
          .eq("cooperative_id", cooperativeId);
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
    mutationFn: async (userId: string): Promise<Socio> => {
      const { data, error } = await supabase
        .from("socios")
        .insert({ cooperative_id: cooperativeId, created_by: userId, activo: true })
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

export function useDeleteSocios(cooperativeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("socios")
        .delete()
        .in("id", ids)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sociosQueryKey(cooperativeId) });
    },
  });
}