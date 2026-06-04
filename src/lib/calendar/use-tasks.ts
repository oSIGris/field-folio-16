import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_curso", label: "En curso" },
  { value: "bloqueada", label: "Bloqueada" },
  { value: "hecha", label: "Hecha" },
  { value: "cancelada", label: "Cancelada" },
];

export const OPEN_TASK_STATUSES: TaskStatus[] = [
  "pendiente",
  "en_curso",
  "bloqueada",
];

export function taskPriorityLabel(p: TaskPriority) {
  return TASK_PRIORITIES.find((x) => x.value === p)?.label ?? p;
}
export function taskStatusLabel(s: TaskStatus) {
  return TASK_STATUSES.find((x) => x.value === s)?.label ?? s;
}

export interface TaskInput {
  id?: string;
  title: string;
  description: string | null;
  due_date: string | null;
  reminder_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  socio_id: string | null;
  aid_application_id: string | null;
  assigned_to: string | null;
}

export function useTasks(cooperativeId: string, socioId?: string) {
  return useQuery({
    queryKey: ["tasks", cooperativeId, socioId ?? "all"],
    enabled: !!cooperativeId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Task[]> => {
      let q = supabase
        .from("tasks")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .is("archived_at", null);
      if (socioId) q = q.eq("socio_id", socioId);
      const { data, error } = await q
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveTask(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TaskInput) => {
      const completed_at =
        input.status === "hecha" ? new Date().toISOString() : null;
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase
          .from("tasks")
          .update({ ...patch, completed_at, updated_by: userId })
          .eq("id", id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { id: _omit, ...rest } = input;
        const { error } = await supabase.from("tasks").insert({
          ...rest,
          completed_at,
          cooperative_id: cooperativeId,
          created_by: userId,
          updated_by: userId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", cooperativeId] }),
  });
}

export function useUpdateTaskStatus(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase
        .from("tasks")
        .update({
          status,
          completed_at: status === "hecha" ? new Date().toISOString() : null,
          updated_by: userId,
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", cooperativeId] }),
  });
}

export function useArchiveTask(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ archived_at: new Date().toISOString(), archived_by: userId })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", cooperativeId] }),
  });
}