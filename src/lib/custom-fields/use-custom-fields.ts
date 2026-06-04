import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type CustomField = Database["public"]["Tables"]["custom_fields"]["Row"];
export type CustomFieldValue =
  Database["public"]["Tables"]["custom_field_values"]["Row"];
export type CustomFieldType = Database["public"]["Enums"]["custom_field_type"];
export type CustomFieldScope = Database["public"]["Enums"]["custom_field_scope"];

export interface CustomFieldOption {
  value: string;
  label: string;
}

export const CUSTOM_FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "long_text", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "currency", label: "Importe (€)" },
  { value: "percentage", label: "Porcentaje (%)" },
  { value: "date", label: "Fecha" },
  { value: "boolean", label: "Sí / No" },
  { value: "select", label: "Selección" },
  { value: "multiselect", label: "Selección múltiple" },
];

export function parseOptions(options: Json): CustomFieldOption[] {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => {
      if (typeof o === "string") return { value: o, label: o };
      if (o && typeof o === "object" && "value" in o) {
        const obj = o as Record<string, unknown>;
        return {
          value: String(obj.value),
          label: String(obj.label ?? obj.value),
        };
      }
      return null;
    })
    .filter((o): o is CustomFieldOption => !!o);
}

/** Slugify a field name into a stable storage key. */
export function toFieldKey(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50) || `campo_${Date.now()}`
  );
}

/** Read the typed value stored for a field on a value row. */
export function readFieldValue(
  field: CustomField,
  row: CustomFieldValue | undefined,
): unknown {
  if (!row) return null;
  switch (field.field_type) {
    case "number":
    case "currency":
    case "percentage":
      return row.value_number;
    case "date":
      return row.value_date;
    case "boolean":
      return row.value_boolean;
    case "multiselect":
      return Array.isArray(row.value_json) ? row.value_json : [];
    default:
      return row.value_text;
  }
}

/** Build the column patch for a given typed value. */
export function buildValueColumns(
  field: CustomField,
  value: unknown,
): Partial<CustomFieldValue> {
  const base: Partial<CustomFieldValue> = {
    value_text: null,
    value_number: null,
    value_date: null,
    value_boolean: null,
    value_json: null,
  };
  switch (field.field_type) {
    case "number":
    case "currency":
    case "percentage":
      base.value_number =
        value === null || value === "" ? null : Number(value);
      break;
    case "date":
      base.value_date = (value as string) || null;
      break;
    case "boolean":
      base.value_boolean = !!value;
      break;
    case "multiselect":
      base.value_json = (Array.isArray(value) ? value : []) as Json;
      break;
    default:
      base.value_text = (value as string) || null;
  }
  return base;
}

// ---------------- Field definitions ----------------
export function useCustomFields(
  cooperativeId: string,
  scope: CustomFieldScope,
  includeArchived = false,
) {
  return useQuery({
    queryKey: ["custom_fields", cooperativeId, scope, includeArchived],
    enabled: !!cooperativeId,
    staleTime: 60_000,
    queryFn: async (): Promise<CustomField[]> => {
      let q = supabase
        .from("custom_fields")
        .select("*")
        .eq("cooperative_id", cooperativeId)
        .eq("scope", scope)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!includeArchived) q = q.is("archived_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveCustomField(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      scope: CustomFieldScope;
      name: string;
      key: string;
      field_type: CustomFieldType;
      options: CustomFieldOption[];
      required: boolean;
      visible: boolean;
      description: string | null;
    }) => {
      const payload = {
        name: input.name,
        field_type: input.field_type,
        options: input.options as unknown as Json,
        required: input.required,
        visible: input.visible,
        description: input.description,
      };
      if (input.id) {
        const { error } = await supabase
          .from("custom_fields")
          .update(payload)
          .eq("id", input.id)
          .eq("cooperative_id", cooperativeId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("custom_fields").insert({
          cooperative_id: cooperativeId,
          created_by: userId,
          scope: input.scope,
          key: input.key,
          ...payload,
        });
        if (error) throw error;
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["custom_fields", cooperativeId] }),
  });
}

export function useArchiveCustomField(cooperativeId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("custom_fields")
        .update({
          archived_at: archived ? new Date().toISOString() : null,
          archived_by: archived ? userId : null,
        })
        .eq("id", id)
        .eq("cooperative_id", cooperativeId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["custom_fields", cooperativeId] }),
  });
}

// ---------------- Values for socios ----------------
/** Map of socioId -> (custom_field_id -> value row). */
export type SocioValueMap = Map<string, Map<string, CustomFieldValue>>;

export function socioValuesKey(cooperativeId: string) {
  return ["custom_field_values", "socio", cooperativeId] as const;
}

export function useSocioCustomValues(
  cooperativeId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: socioValuesKey(cooperativeId),
    // Only fetch when there is at least one socio custom field; otherwise this
    // would pull tens of thousands of empty value rows for nothing.
    enabled: !!cooperativeId && enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<SocioValueMap> => {
      const { data, error } = await supabase
        .from("custom_field_values")
        .select(
          "custom_field_id,socio_id,value_text,value_number,value_date,value_boolean,value_json",
        )
        .eq("cooperative_id", cooperativeId)
        .not("socio_id", "is", null)
        .limit(50000);
      if (error) throw error;
      const map: SocioValueMap = new Map();
      for (const row of data ?? []) {
        if (!row.socio_id) continue;
        let inner = map.get(row.socio_id);
        if (!inner) {
          inner = new Map();
          map.set(row.socio_id, inner);
        }
        inner.set(row.custom_field_id, row as CustomFieldValue);
      }
      return map;
    },
  });
}

export interface SocioValueEdit {
  socioId: string;
  field: CustomField;
  value: unknown;
}

export function useSaveSocioCustomValues(
  cooperativeId: string,
  userId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (edits: SocioValueEdit[]) => {
      for (const edit of edits) {
        const cols = buildValueColumns(edit.field, edit.value);
        const { error } = await supabase.from("custom_field_values").upsert(
          {
            cooperative_id: cooperativeId,
            custom_field_id: edit.field.id,
            socio_id: edit.socioId,
            updated_by: userId,
            ...cols,
          },
          { onConflict: "custom_field_id,socio_id" },
        );
        if (error) throw error;
      }
      return edits.length;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: socioValuesKey(cooperativeId) }),
  });
}