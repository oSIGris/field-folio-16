import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AutomationRule =
  Database["public"]["Tables"]["automation_rules"]["Row"];
export type AutomationRuleType =
  Database["public"]["Enums"]["automation_rule_type"];
export type AutomationRuleStatus =
  Database["public"]["Enums"]["automation_rule_status"];

export interface RuleTemplate {
  value: AutomationRuleType;
  label: string;
  description: string;
  usesDays: boolean;
  defaultDays: number;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    value: "avisar_antes",
    label: "Avisar X días antes de una fecha",
    description:
      "Genera un aviso interno antes de una fecha límite de tarea o expediente.",
    usesDays: true,
    defaultDays: 7,
  },
  {
    value: "falta_documentacion",
    label: "Falta documentación",
    description:
      "Detecta expedientes marcados como falta de documentación y avisa al técnico.",
    usesDays: false,
    defaultDays: 0,
  },
  {
    value: "expediente_parado",
    label: "Expediente parado N días",
    description: "Avisa cuando un expediente lleva N días sin cambios.",
    usesDays: true,
    defaultDays: 15,
  },
  {
    value: "subvencion_sin_expediente",
    label: "Subvención marcada sin expediente",
    description:
      "Detecta socios con subvención marcada pero sin expediente de ayuda.",
    usesDays: false,
    defaultDays: 0,
  },
  {
    value: "fecha_aviso_socio",
    label: "Fecha de aviso del socio",
    description: "Avisa cuando se acerca la fecha de aviso registrada del socio.",
    usesDays: true,
    defaultDays: 3,
  },
];

export const RULE_STATUS_LABEL: Record<AutomationRuleStatus, string> = {
  activa: "Activa",
  pausada: "Pausada",
  archivada: "Archivada",
};

export function ruleTemplate(t: AutomationRuleType) {
  return RULE_TEMPLATES.find((x) => x.value === t);
}

export interface RuleInput {
  id?: string;
  name: string;
  rule_type: AutomationRuleType;
  days_before: number;
  create_email_draft: boolean;
}

export function useAutomationRules(cooperativeId: string) {
  return useQuery({
    queryKey: ["automation_rules", cooperativeId],
    enabled: !!cooperativeId,
    staleTime: 30_000,
    queryFn: async (): Promise<AutomationRule[]> => {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveRule(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RuleInput) => {
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase
          .from("automation_rules")
          .update({ ...patch, updated_by: userId })
          .eq("id", id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { id: _omit, ...rest } = input;
        const { error } = await supabase.from("automation_rules").insert({
          ...rest,
          channel: "notificacion_interna",
          status: "activa",
          cooperative_id: cooperativeId,
          created_by: userId,
          updated_by: userId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["automation_rules", cooperativeId] }),
  });
}

export function useSetRuleStatus(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AutomationRuleStatus;
    }) => {
      const patch: Database["public"]["Tables"]["automation_rules"]["Update"] = {
        status,
        updated_by: userId,
        ...(status === "archivada"
          ? { archived_at: new Date().toISOString(), archived_by: userId }
          : {}),
      };
      const { error } = await supabase
        .from("automation_rules")
        .update(patch)
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["automation_rules", cooperativeId] }),
  });
}