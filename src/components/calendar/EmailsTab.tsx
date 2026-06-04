import { useEffect, useState } from "react";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/calendar/format";
import {
  EMAIL_STATUSES,
  emailStatusLabel,
  useEmailDrafts,
  useSaveEmailDraft,
  useSetDraftStatus,
  type EmailDraft,
  type EmailDraftInput,
  type EmailDraftStatus,
} from "@/lib/emails/use-emails";
import { SocioPicker } from "./RelationPicker";
import { EMAIL_TONE } from "./tones";

const EMPTY: EmailDraftInput = {
  recipient: null,
  subject: "",
  body: "",
  socio_id: null,
  task_id: null,
  status: "draft",
};

export function EmailsTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: drafts = [] } = useEmailDrafts(cooperativeId);
  const save = useSaveEmailDraft(cooperativeId, userId);
  const setStatus = useSetDraftStatus(cooperativeId, userId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmailDraftInput>(EMPTY);

  useEffect(() => {
    if (open) return;
  }, [open]);

  const set = <K extends keyof EmailDraftInput>(k: K, v: EmailDraftInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openNew = (d?: EmailDraft) => {
    if (d) {
      setForm({
        id: d.id,
        recipient: d.recipient,
        subject: d.subject,
        body: d.body,
        socio_id: d.socio_id,
        task_id: d.task_id,
        status: d.status,
      });
    } else {
      setForm(EMPTY);
    }
    setOpen(true);
  };

  const submit = async () => {
    if (!form.subject.trim()) {
      toast.error("El asunto es obligatorio");
      return;
    }
    try {
      await save.mutateAsync(form);
      toast.success("Borrador guardado");
      setOpen(false);
    } catch (e) {
      toast.error("No se pudo guardar", { description: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Solo borradores. No se envían correos reales todavía.
        </p>
        {canEdit && (
          <Button size="sm" onClick={() => openNew()}>
            <Plus className="mr-1.5 h-4 w-4" /> Nuevo borrador
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {drafts.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
            Sin borradores todavía.
          </p>
        ) : (
          drafts.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => canEdit && openNew(d)}
              className="flex w-full items-start gap-3 rounded-md border bg-card px-3 py-2 text-left hover:bg-accent/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {d.subject || "(sin asunto)"}
                  </span>
                  <Badge className={cn("h-5 px-1.5", EMAIL_TONE[d.status])}>
                    {emailStatusLabel(d.status)}
                  </Badge>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {d.recipient ? `Para: ${d.recipient} · ` : ""}
                  {d.body || "Sin contenido"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {fmtDate(d.created_at)}
              </span>
            </button>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar borrador" : "Nuevo borrador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="d-to">Destinatario (opcional)</Label>
              <Input
                id="d-to"
                value={form.recipient ?? ""}
                onChange={(e) => set("recipient", e.target.value || null)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-subj">Asunto</Label>
              <Input
                id="d-subj"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-body">Cuerpo</Label>
              <Textarea
                id="d-body"
                className="min-h-32"
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Socio (opcional)</Label>
                <SocioPicker
                  cooperativeId={cooperativeId}
                  value={form.socio_id}
                  onChange={(v) => set("socio_id", v)}
                />
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as EmailDraftStatus)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_STATUSES.filter((s) => s.value !== "sent").map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            {form.id && (
              <Button
                variant="ghost"
                className="mr-auto text-destructive"
                onClick={() => {
                  setStatus.mutate({ id: form.id!, status: "cancelled" });
                  setOpen(false);
                }}
              >
                Cancelar borrador
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}