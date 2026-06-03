import { useState } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingScreen({ onCreated }: { onCreated: () => void }) {
  const { user, signOut } = useAuth();
  const [nombre, setNombre] = useState("");
  const [cif, setCif] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: coop, error: coopError } = await supabase
      .from("cooperatives")
      .insert({ nombre: nombre.trim(), cif: cif.trim() || null, created_by: user.id })
      .select("id")
      .single();

    if (coopError || !coop) {
      setSaving(false);
      toast.error("No se pudo crear la cooperativa", { description: coopError?.message });
      return;
    }

    const { error: memberError } = await supabase.from("organization_members").insert({
      user_id: user.id,
      cooperative_id: coop.id,
      role: "admin",
    });

    setSaving(false);

    if (memberError) {
      toast.error("No se pudo asignar tu acceso", { description: memberError.message });
      return;
    }

    toast.success("Cooperativa creada");
    onCreated();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Crea tu cooperativa</h1>
            <p className="text-sm text-muted-foreground">
              Para empezar, registra la cooperativa que vas a gestionar. Serás su
              administrador.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="coop-nombre">Nombre de la cooperativa</Label>
            <Input
              id="coop-nombre"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Cooperativa Agrícola San Isidro"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coop-cif">CIF (opcional)</Label>
            <Input
              id="coop-cif"
              value={cif}
              onChange={(e) => setCif(e.target.value)}
              placeholder="F-00000000"
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving || !nombre.trim()}>
            {saving ? "Creando…" : "Crear cooperativa"}
          </Button>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}