import type { Database } from "@/integrations/supabase/types";

export type Socio = Database["public"]["Tables"]["socios"]["Row"];

export type FieldType = "text" | "date" | "boolean" | "enum";

export interface FieldDef {
  key: keyof Socio;
  label: string;
  type: FieldType;
  width: number;
  options?: { value: string; label: string }[];
}

export const TIPO_OPTIONS = [
  { value: "persona_fisica", label: "Persona física" },
  { value: "persona_juridica", label: "Persona jurídica" },
];

// Column order + metadata for the Socios grid.
export const SOCIO_FIELDS: FieldDef[] = [
  { key: "codigo_socio", label: "Código", type: "text", width: 100 },
  { key: "tipo", label: "Tipo", type: "enum", width: 140, options: TIPO_OPTIONS },
  { key: "nif", label: "NIF/CIF", type: "text", width: 110 },
  { key: "nombre", label: "Nombre", type: "text", width: 150 },
  { key: "apellidos", label: "Apellidos", type: "text", width: 170 },
  { key: "razon_social", label: "Razón social", type: "text", width: 180 },
  { key: "email", label: "Email", type: "text", width: 200 },
  { key: "telefono", label: "Teléfono", type: "text", width: 120 },
  { key: "direccion", label: "Dirección", type: "text", width: 200 },
  { key: "municipio", label: "Municipio", type: "text", width: 150 },
  { key: "provincia", label: "Provincia", type: "text", width: 130 },
  { key: "codigo_postal", label: "C.P.", type: "text", width: 80 },
  { key: "iban", label: "IBAN", type: "text", width: 190 },
  { key: "fecha_alta", label: "Fecha alta", type: "date", width: 120 },
  { key: "fecha_baja", label: "Fecha baja", type: "date", width: 120 },
  { key: "activo", label: "Activo", type: "boolean", width: 70 },
  { key: "notas", label: "Notas", type: "text", width: 240 },
];

export function socioDisplayName(s: Pick<Socio, "nombre" | "apellidos" | "razon_social" | "codigo_socio">) {
  if (s.razon_social) return s.razon_social;
  const full = [s.nombre, s.apellidos].filter(Boolean).join(" ").trim();
  return full || s.codigo_socio || "Socio sin nombre";
}