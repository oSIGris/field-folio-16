import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocios } from "@/lib/socios/use-socios";
import { useSocioApplications } from "@/lib/aids/use-aids";
import { socioDisplayName } from "@/lib/socios/socios-fields";

const NONE = "__none__";

export function SocioPicker({
  cooperativeId,
  value,
  onChange,
  disabled,
}: {
  cooperativeId: string;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const { data: socios = [] } = useSocios(cooperativeId);
  return (
    <Select
      value={value ?? NONE}
      disabled={disabled}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder="Sin socio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sin socio</SelectItem>
        {socios.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {socioDisplayName(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ExpedientePicker({
  cooperativeId,
  socioId,
  value,
  onChange,
  disabled,
}: {
  cooperativeId: string;
  socioId: string | null;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const { data: apps = [] } = useSocioApplications(
    cooperativeId,
    socioId ?? undefined,
  );
  return (
    <Select
      value={value ?? NONE}
      disabled={disabled || !socioId}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder={socioId ? "Sin expediente" : "Elige socio"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sin expediente</SelectItem>
        {apps.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.title || "Expediente"} ·{" "}
            {new Date(a.created_at).toLocaleDateString("es-ES")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}