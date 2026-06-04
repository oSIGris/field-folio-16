import { useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Socio } from "./socios-fields";

type SocioUpdate = Partial<Socio>;

/**
 * Only the columns actually consumed by the grid, drawer, cards, search and
 * metrics. Avoids `select("*")` so we don't ship unused/heavy columns over the
 * wire for thousands of rows.
 */
const SOCIO_COLUMNS = [
  "id",
  "cooperative_id",
  "codigo_socio",
  "tipo",
  "nif",
  "nif_cif",
  "nombre",
  "apellidos",
  "razon_social",
  "email",
  "telefono",
  "telefono_1",
  "telefono_2",
  "direccion",
  "municipio",
  "poblacion",
  "provincia",
  "codigo_postal",
  "fecha_aviso",
  "subvencion",
  "alta",
  "baja",
  "traspaso",
  "p6_p7",
  "finaliza",
  "registra",
  "cuaderno",
  "ayudas_borras",
  "cooperativa_codigo",
  "observaciones",
  "observaciones_2025",
  "activo",
  "created_at",
  "deleted_at",
].join(",");

/** Rows fetched per network round-trip for incremental loading. */
export const SOCIOS_PAGE_SIZE = 1000;

export function sociosQueryKey(cooperativeId: string) {
  return ["socios", cooperativeId] as const;
}

/**
 * Incremental loader: the first page (1000 rows) renders almost immediately
 * and the remaining pages are fetched in the background, so the grid stays
 * fast even with 3000-5000 socios. Returns a `useQuery`-compatible shape
 * (`data` is the flattened list) so existing callers keep working.
 */
export function useSocios(cooperativeId: string) {
  const query = useInfiniteQuery({
    queryKey: sociosQueryKey(cooperativeId),
    enabled: !!cooperativeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<Socio[]> => {
      const from = (pageParam as number) * SOCIOS_PAGE_SIZE;
      const to = from + SOCIOS_PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("socios")
        .select(SOCIO_COLUMNS)
        .eq("cooperative_id", cooperativeId)
        .is("deleted_at", null)
        .order("nif_cif", { ascending: true, nullsFirst: false })
        .order("nombre", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .range(from, to);
      if (error) throw error;
      return (data ?? []) as unknown as Socio[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === SOCIOS_PAGE_SIZE ? allPages.length : undefined,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  // Keep pulling the remaining pages in the background until everything is in.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const data = useMemo(
    () => (query.data?.pages ?? []).flat(),
    [query.data],
  );

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage,
    isFetchingNextPage,
  };
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
      return data as Socio;
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
