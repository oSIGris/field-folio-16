import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  SOCIO_FIELDS,
  socioDisplayName,
  TIPO_OPTIONS,
  type Socio,
} from "@/lib/socios/socios-fields";

interface Props {
  socio: Socio | null;
  open: boolean;
  canEdit: boolean;
  cooperativeId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function SocioDrawer({
  socio,
  open,
  canEdit,
  cooperativeId,
  onOpenChange,
  onSaved,
}: Props) {
  const [form, setForm] = useState<Partial<Socio>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(socio ?? {});
  }, [socio]);

  if (!socio) return null;

  const set = (key: keyof Socio, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const {
      id,
      created_at,
      updated_at,
      cooperative_id,
      created_by,
      updated_by,
      deleted_at,
      ...patch
    } = form as Socio;
    const { error } = await supabase
      .from("socios")
      .update(patch)
      .eq("id", socio.id)
      .eq("cooperative_id", cooperativeId)
      .is("deleted_at", null);
    setSaving(false);
    if (error) {
      toast.error("No se pudo guardar", { description: error.message });
      return;
    }
    toast.success("Socio actualizado");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{socioDisplayName(form as Socio)}</SheetTitle>
          <SheetDescription>Ficha del socio</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {SOCIO_FIELDS.map((field) => {
            const value = form[field.key];
            if (field.type === "boolean") {
              return (
                <label key={field.key} className="flex items-center gap-2 py-1">
                  <Checkbox
                    checked={!!value}
                    disabled={!canEdit}
                    onCheckedChange={(c) => set(field.key, !!c)}
                  />
                  <span className="text-sm">{field.label}</span>
                </label>
              );
            }
            if (field.type === "enum") {
              return (
                <div key={field.key} className="space-y-1">
                  <Label>{field.label}</Label>
                  <Select
                    value={(value as string) ?? ""}
                    disabled={!canEdit}
                    onValueChange={(v) => set(field.key, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? TIPO_OPTIONS).map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (field.type === "long_text") {
              return (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`f-${field.key}`}>{field.label}</Label>
                  <Textarea
                    id={`f-${field.key}`}
                    value={(value as string) ?? ""}
                    disabled={!canEdit}
                    className="min-h-24 resize-y"
                    onChange={(e) => set(field.key, e.target.value || null)}
                  />
                </div>
              );
            }
            return (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`f-${field.key}`}>{field.label}</Label>
                <Input
                  id={`f-${field.key}`}
                  type={field.type === "date" ? "date" : "text"}
                  value={(value as string) ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => set(field.key, e.target.value || null)}
                />
              </div>
            );
          })}
        </div>

        {canEdit && (
          <SheetFooter className="mt-6">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
