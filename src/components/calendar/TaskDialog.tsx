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
  TASK_PRIORITIES,
  TASK_STATUSES,
  useSaveTask,
  type Task,
  type TaskInput,
} from "@/lib/calendar/use-tasks";
import { SocioPicker, ExpedientePicker } from "./RelationPicker";

const EMPTY: TaskInput = {
  title: "",
  description: null,
  due_date: null,
  reminder_at: null,
  priority: "normal",
  status: "pendiente",
  socio_id: null,
  aid_application_id: null,
  assigned_to: null,
};

export function TaskDialog({
  open,
  onOpenChange,
  cooperativeId,
  userId,
  task,
  lockedSocioId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cooperativeId: string;
  userId: string;
  task?: Task | null;
  lockedSocioId?: string;
}) {
  const save = useSaveTask(cooperativeId, userId);
  const [form, setForm] = useState<TaskInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        reminder_at: task.reminder_at,
        priority: task.priority,
        status: task.status,
        socio_id: task.socio_id,
        aid_application_id: task.aid_application_id,
        assigned_to: task.assigned_to,
      });
    } else {
      setForm({ ...EMPTY, socio_id: lockedSocioId ?? null });
    }
  }, [open, task, lockedSocioId]);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    try {
      await save.mutateAsync(form);
      toast.success(task ? "Tarea actualizada" : "Tarea creada");
      onOpenChange(false);
    } catch (e) {
      toast.error("No se pudo guardar", { description: (e as Error).message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="t-title">Título</Label>
            <Input
              id="t-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="t-desc">Descripción</Label>
            <Textarea
              id="t-desc"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value || null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="t-due">Fecha límite</Label>
              <Input
                id="t-due"
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => set("due_date", e.target.value || null)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="t-rem">Recordatorio</Label>
              <Input
                id="t-rem"
                type="datetime-local"
                value={isoToLocal(form.reminder_at)}
                onChange={(e) => set("reminder_at", localToIso(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Prioridad</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as TaskInput["priority"])}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as TaskInput["status"])}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {!lockedSocioId && (
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
          )}
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