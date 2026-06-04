import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { isoToLocal, localToIso } from "@/lib/calendar/format";
import {
  EVENT_TYPES,
  useSaveEvent,
  type CalendarEvent,
  type EventInput,
} from "@/lib/calendar/use-events";
import { SocioPicker, ExpedientePicker } from "./RelationPicker";

function emptyEvent(): EventInput {
  return {
    title: "",
    description: null,
    event_type: "recordatorio",
    starts_at: new Date().toISOString(),
    ends_at: null,
    all_day: false,
    socio_id: null,
    aid_application_id: null,
  };
}

export function EventDialog({
  open,
  onOpenChange,
  cooperativeId,
  userId,
  event,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cooperativeId: string;
  userId: string;
  event?: CalendarEvent | null;
}) {
  const save = useSaveEvent(cooperativeId, userId);
  const [form, setForm] = useState<EventInput>(emptyEvent);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({
        id: event.id,
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        all_day: event.all_day,
        socio_id: event.socio_id,
        aid_application_id: event.aid_application_id,
      });
    } else {
      setForm(emptyEvent());
    }
  }, [open, event]);

  const set = <K extends keyof EventInput>(k: K, v: EventInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (!form.starts_at) {
      toast.error("La fecha de inicio es obligatoria");
      return;
    }
    try {
      await save.mutateAsync(form);
      toast.success(event ? "Evento actualizado" : "Evento creado");
      onOpenChange(false);
    } catch (e) {
      toast.error("No se pudo guardar", { description: (e as Error).message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Nuevo evento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="e-title">Título</Label>
            <Input
              id="e-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="e-desc">Descripción</Label>
            <Textarea
              id="e-desc"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value || null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={form.event_type}
                onValueChange={(v) =>
                  set("event_type", v as EventInput["event_type"])
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 pt-6">
              <Checkbox
                checked={form.all_day}
                onCheckedChange={(c) => set("all_day", !!c)}
              />
              <span className="text-sm">Todo el día</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="e-start">Inicio</Label>
              <Input
                id="e-start"
                type="datetime-local"
                value={isoToLocal(form.starts_at)}
                onChange={(e) =>
                  set(
                    "starts_at",
                    localToIso(e.target.value) ?? new Date().toISOString(),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-end">Fin (opcional)</Label>
              <Input
                id="e-end"
                type="datetime-local"
                value={isoToLocal(form.ends_at)}
                onChange={(e) => set("ends_at", localToIso(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Socio</Label>
              <SocioPicker
                cooperativeId={cooperativeId}
                value={form.socio_id}
                onChange={(v) => {
                  set("socio_id", v);
                  set("aid_application_id", null);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Expediente</Label>
              <ExpedientePicker
                cooperativeId={cooperativeId}
                socioId={form.socio_id}
                value={form.aid_application_id}
                onChange={(v) => set("aid_application_id", v)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}