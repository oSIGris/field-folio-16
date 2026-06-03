import type { Database } from "@/integrations/supabase/types";

type BaseSocio = Database["public"]["Tables"]["socios"]["Row"];

export type Socio = BaseSocio & {
  nif_cif: string | null;
  telefono_1: string | null;
  telefono_2: string | null;
  fecha_aviso: string | null;
  subvencion: boolean;
  alta: boolean;
  baja: boolean;
  traspaso: boolean;
  p6_p7: string | null;
  finaliza: boolean;
  registra: boolean;
  cuaderno: boolean;
  ayudas_borras: boolean;
  cooperativa_codigo: string | null;
  observaciones: string | null;
  observaciones_2025: string | null;
  poblacion: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  whatsapp_phone_e164: string | null;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_at: string | null;
  whatsapp_last_interaction_at: string | null;
};

export type FieldType = "text" | "date" | "boolean" | "enum" | "long_text";

export interface FieldDef {
  key: keyof Socio;
  label: string;
  type: FieldType;
  width: number;
  options?: { value: string; label: string }[];
}

export const TIPO_OPTIONS = [
  { value: "persona_fisica", label: "Persona fisica" },
  { value: "persona_juridica", label: "Persona juridica" },
];

// Column order + metadata for the PAC/Access-style Socios grid.
export const SOCIO_FIELDS: FieldDef[] = [
  { key: "nif_cif", label: "NIF/CIF", type: "text", width: 112 },
  { key: "nombre", label: "Nombre", type: "text", width: 210 },
  { key: "telefono_1", label: "Telefono 1", type: "text", width: 112 },
  { key: "telefono_2", label: "Telefono 2", type: "text", width: 112 },
  { key: "fecha_aviso", label: "Fecha aviso", type: "date", width: 124 },
  { key: "subvencion", label: "Subv.", type: "boolean", width: 70 },
  { key: "alta", label: "Alta", type: "boolean", width: 64 },
  { key: "baja", label: "Baja", type: "boolean", width: 64 },
  { key: "traspaso", label: "Trasp.", type: "boolean", width: 70 },
  { key: "p6_p7", label: "P6/P7", type: "text", width: 130 },
  { key: "finaliza", label: "Finaliza", type: "boolean", width: 82 },
  { key: "registra", label: "Registra", type: "boolean", width: 82 },
  { key: "cuaderno", label: "Cuaderno", type: "boolean", width: 86 },
  { key: "ayudas_borras", label: "Ayudas Borras", type: "boolean", width: 112 },
  { key: "cooperativa_codigo", label: "Coop.", type: "text", width: 100 },
  { key: "observaciones", label: "Observaciones", type: "long_text", width: 340 },
  { key: "observaciones_2025", label: "Observaciones 2025", type: "long_text", width: 320 },
  { key: "poblacion", label: "Poblacion", type: "text", width: 150 },
];

export function socioDisplayName(
  s: Pick<Socio, "nombre" | "razon_social" | "codigo_socio" | "nif_cif">,
) {
  if (s.razon_social) return s.razon_social;
  if (s.nombre) return s.nombre;
  return s.nif_cif || s.codigo_socio || "Socio sin nombre";
}
