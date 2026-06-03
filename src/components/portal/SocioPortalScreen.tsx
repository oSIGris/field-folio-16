import { LogOut, Sprout, FileText, Phone, MapPin, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { socioDisplayName, type Socio } from "@/lib/socios/socios-fields";

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0 rounded-lg border bg-card px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{String(value || "-")}</p>
    </div>
  );
}

function CheckState({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
      <span>{label}</span>
      <Badge variant={value ? "default" : "secondary"}>{value ? "Si" : "No"}</Badge>
    </div>
  );
}

export function SocioPortalScreen({
  socios,
  onSignOut,
}: {
  socios: Socio[];
  onSignOut: () => void;
}) {
  const socio = socios[0];
  const name = socioDisplayName(socio);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Mi expediente</p>
            <p className="truncate text-xs text-muted-foreground">
              Consulta de datos del socio agricultor
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight">{name}</h1>
              <p className="text-sm text-muted-foreground">
                {socio.nif_cif || "NIF/CIF pendiente"}
              </p>
            </div>
            <Badge variant={socio.baja ? "secondary" : "default"}>
              {socio.baja ? "Baja" : "En curso"}
            </Badge>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="NIF/CIF" value={socio.nif_cif} />
            <Field label="Poblacion" value={socio.poblacion} />
            <Field label="Cooperativa" value={socio.cooperativa_codigo} />
            <Field label="Telefono 1" value={socio.telefono_1} />
            <Field label="Telefono 2" value={socio.telefono_2} />
            <Field label="Fecha aviso" value={socio.fecha_aviso} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <CheckState label="Subvencion" value={socio.subvencion} />
            <CheckState label="Alta" value={socio.alta} />
            <CheckState label="Baja" value={socio.baja} />
            <CheckState label="Cuaderno" value={socio.cuaderno} />
            <CheckState label="Finaliza" value={socio.finaliza} />
            <CheckState label="Registra" value={socio.registra} />
            <CheckState label="Traspaso" value={socio.traspaso} />
            <CheckState label="Ayudas Borras" value={socio.ayudas_borras} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4" />
                Observaciones
              </p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {socio.observaciones || "Sin observaciones visibles."}
              </p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Observaciones 2025
              </p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {socio.observaciones_2025 || "Sin observaciones visibles."}
              </p>
            </div>
          </div>
        </section>

        {socios.length > 1 && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Tu usuario tiene varios expedientes enlazados. En esta primera version se muestra el primero.
          </p>
        )}
      </main>
    </div>
  );
}
