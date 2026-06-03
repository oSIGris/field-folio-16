import { Phone, MapPin, Hash, Building2, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { socioDisplayName, TIPO_OPTIONS, type Socio } from "@/lib/socios/socios-fields";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function SocioCard({
  socio,
  onOpen,
}: {
  socio: Socio;
  onOpen: (s: Socio) => void;
}) {
  const name = socioDisplayName(socio);
  const tipoLabel = TIPO_OPTIONS.find((t) => t.value === socio.tipo)?.label;

  const lines = [
    socio.telefono_1 && { icon: Phone, value: socio.telefono_1 },
    socio.telefono_2 && { icon: Phone, value: socio.telefono_2 },
    socio.poblacion && { icon: MapPin, value: socio.poblacion },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  return (
    <button
      type="button"
      onClick={() => onOpen(socio)}
      className="group flex w-full flex-col gap-3 rounded-lg border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          {socio.tipo === "persona_juridica" ? (
            <Building2 className="h-5 w-5" />
          ) : (
            initials(name) || <User className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            {socio.nif_cif || socio.codigo_socio || "Sin NIF/CIF"}
            {tipoLabel ? ` - ${tipoLabel}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            socio.baja
              ? "bg-muted text-muted-foreground"
              : socio.subvencion
                ? "bg-success/15 text-success"
                : "bg-primary/10 text-primary",
          )}
        >
          {socio.baja ? "Baja" : socio.subvencion ? "Subvencion" : "Activo"}
        </span>
      </div>

      {lines.length > 0 && (
        <div className="space-y-1 border-t pt-3">
          {lines.map((l, i) => (
            <p key={i} className="flex items-center gap-2 truncate text-xs text-muted-foreground">
              <l.icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{l.value}</span>
            </p>
          ))}
        </div>
      )}
    </button>
  );
}
