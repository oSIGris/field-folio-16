import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];
export type CalendarEventType =
  Database["public"]["Enums"]["calendar_event_type"];

export const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: "vencimiento", label: "Vencimiento" },
  { value: "recordatorio", label: "Recordatorio" },
  { value: "cita", label: "Cita" },
  { value: "llamada", label: "Llamada" },
  { value: "interno", label: "Interno" },
];

export function eventTypeLabel(t: CalendarEventType) {
  return EVENT_TYPES.find((x) => x.value === t)?.label ?? t;
}

export interface EventInput {
  id?: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  socio_id: string | null;
  aid_application_id: string | null;
}

/** Lower bound (days back) for the events window loaded by default. */
const EVENTS_WINDOW_DAYS_BACK = 30;

export function useEvents(cooperativeId: string, daysBack = EVENTS_WINDOW_DAYS_BACK) {
  return useQuery({
    queryKey: ["calendar_events", cooperativeId, daysBack],
    enabled: !!cooperativeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<CalendarEvent[]> => {
      const from = new Date(
        Date.now() - daysBack * 86_400_000,
      ).toISOString();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .is("archived_at", null)
        .gte("starts_at", from)
        .order("starts_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveEvent(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput) => {
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase
          .from("calendar_events")
          .update(patch)
          .eq("id", id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { id: _omit, ...rest } = input;
        const { error } = await supabase.from("calendar_events").insert({
          ...rest,
          cooperative_id: cooperativeId,
          created_by: userId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar_events", cooperativeId] }),
  });
}

export function useArchiveEvent(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .update({ archived_at: new Date().toISOString(), archived_by: userId })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["calendar_events", cooperativeId] }),
  });
}