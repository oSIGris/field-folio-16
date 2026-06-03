import { useState } from "react";
import { toast } from "sonner";
import { Building2, User, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateSocio } from "@/lib/socios/use-socios";
import type { Socio } from "@/lib/socios/socios-fields";

type Tipo = "persona_fisica" | "persona_juridica";

interface Props {
  open: boolean;
  cooperativeId: string;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onCreated?: (socio: Socio) => void;
}

const EMPTY = {
  tipo: "persona_fisica" as Tipo,
  nombre: "",
  razon_social: "",
  nif_cif: "",
  telefono_1: "",
  email: "",
  poblacion: "",
  subvencion: false,
};

export function NuevoSocioDialog({
  open,
  cooperativeId,
  userId,
  onOpenChange,
  onCreated,
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const createMutation = useCreateSocio(cooperativeId);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isJuridica = form.tipo === "persona_juridica";
  const hasName = isJuridica
    ? form.razon_social.trim().length > 0
    : form.nombre.trim().length > 0;

  const close = () => {
    onOpenChange(false);
    setTimeout(() => setForm(EMPTY), 200);
  };

  const handleSubmit = () => {
    const values: Partial<Socio> = {
      tipo: form.tipo,
      nombre: form.nombre.trim() || null,
      razon_social: form.razon_social.trim() || null,
      nif_cif: form.nif_cif.trim() || null,
      telefono_1: form.telefono_1.trim() || null,
      email: form.email.trim() || null,
      poblacion: form.poblacion.trim() || null,
      subvencion: form.subvencion,
    };
    createMutation.mutate(
      { userId, values },
      {
        onSuccess: (socio) => {
          toast.success("Socio creado");
          onCreated?.(socio);
          close();
        },
        onError: (e) =>
          toast.error("No se pudo crear el socio", {
            description: (e as Error).message,
          }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle>Nuevo socio</DialogTitle>
          <DialogDescription>
            Rellena los datos esenciales. Podrás completar la ficha después.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "persona_fisica", label: "Persona física", icon: User },
                { value: "persona_juridica", label: "Persona jurídica", icon: Building2 },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("tipo", opt.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                  form.tipo === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ns-name">
              {isJuridica ? "Razón social" : "Nombre"}
            </Label>
            <Input
              id="ns-name"
              autoFocus
              value={isJuridica ? form.razon_social : form.nombre}
              onChange={(e) =>
                set(isJuridica ? "razon_social" : "nombre", e.target.value)
              }
              placeholder={isJuridica ? "Cooperativa S.L." : "Nombre y apellidos"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ns-nif">NIF/CIF</Label>
              <Input
                id="ns-nif"
                value={form.nif_cif}
                onChange={(e) => set("nif_cif", e.target.value)}
                placeholder="00000000A"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ns-tel">Teléfono</Label>
              <Input
                id="ns-tel"
                value={form.telefono_1}
                onChange={(e) => set("telefono_1", e.target.value)}
                placeholder="600 000 000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ns-email">Email</Label>
              <Input
                id="ns-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="socio@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ns-pob">Población</Label>
              <Input
                id="ns-pob"
                value={form.poblacion}
                onChange={(e) => set("poblacion", e.target.value)}
                placeholder="Población"
              />
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <span className="text-sm font-medium">Tiene subvención</span>
            <Switch
              checked={form.subvencion}
              onCheckedChange={(c) => set("subvencion", c)}
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasName || createMutation.isPending}
          >
            {createMutation.isPending ? "Creando…" : "Crear socio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}