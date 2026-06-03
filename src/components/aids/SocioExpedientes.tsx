import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AID_STATUSES,
  aidStatusLabel,
  useAidCampaigns,
  useAidTypes,
  useArchiveApplication,
  useCreateApplication,
  useSocioApplications,
  useUpdateApplication,
  type AidApplicationStatus,
} from "@/lib/aids/use-aids";

const STATUS_TONE: Record<AidApplicationStatus, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_revision: "bg-primary/15 text-primary",
  falta_documentacion: "bg-warning/20 text-warning-foreground",
  presentado: "bg-primary/15 text-primary",
  subsanacion: "bg-warning/20 text-warning-foreground",
  aprobado: "bg-success/20 text-success",
  rechazado: "bg-destructive/15 text-destructive",
  finalizado: "bg-success/20 text-success",
};

export function SocioExpedientes({
  socioId,
  cooperativeId,
  userId,
  canEdit,
}: {
  socioId: string;
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: applications = [], isLoading } = useSocioApplications(
    cooperativeId,
    socioId,
  );
  const { data: campaigns = [] } = useAidCampaigns(cooperativeId);
  const { data: types = [] } = useAidTypes(cooperativeId);
  const create = useCreateApplication(cooperativeId, userId);
  const update = useUpdateApplication(cooperativeId, userId);
  const archive = useArchiveApplication(cooperativeId, userId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    campaign_id: "",
    aid_type_id: "",
    title: "",
    status: "pendiente" as AidApplicationStatus,
    due_date: "",
    notes: "",
  });

  const handleCreate = () => {
    create.mutate(
      {
        socio_id: socioId,
        campaign_id: form.campaign_id || null,
        aid_type_id: form.aid_type_id || null,
        title: form.title.trim() || null,
        status: form.status,
        due_date: form.due_date || null,
        notes: form.notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Expediente creado");
          setShowForm(false);
          setForm({
            campaign_id: "",
            aid_type_id: "",
            title: "",
            status: "pendiente",
            due_date: "",
            notes: "",
          });
        },
        onError: (e) =>
          toast.error("No se pudo crear", {
            description: (e as Error).message,
          }),
      },
    );
  };

  const campaignName = (id: string | null) =>
    campaigns.find((c) => c.id === id)?.name;
  const typeName = (id: string | null) => types.find((t) => t.id === id)?.name;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Expedientes de ayuda</h3>
        {canEdit && !showForm && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 rounded-lg border bg-secondary/30 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Campaña</Label>
              <Select
                value={form.campaign_id}
                onValueChange={(v) => setForm({ ...form, campaign_id: v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo de ayuda</Label>
              <Select
                value={form.aid_type_id}
                onValueChange={(v) => setForm({ ...form, aid_type_id: v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input
              className="h-8"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Descripción breve"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as AidApplicationStatus })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AID_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha límite</Label>
              <Input
                type="date"
                className="h-8"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notas</Label>
            <Textarea
              className="min-h-14"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={create.isPending}>
              Crear expediente
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando expedientes…</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este socio no tiene expedientes.
        </p>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="space-y-2 rounded-lg border bg-card p-3"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {app.title || typeName(app.aid_type_id) || "Expediente"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[campaignName(app.campaign_id), typeName(app.aid_type_id)]
                      .filter(Boolean)
                      .join(" · ") || "Sin campaña"}
                  </p>
                </div>
                <Badge className={STATUS_TONE[app.status]}>
                  {aidStatusLabel(app.status)}
                </Badge>
              </div>

              {app.due_date && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  Límite: {app.due_date}
                </p>
              )}

              {canEdit && (
                <div className="flex items-center gap-2">
                  <Select
                    value={app.status}
                    onValueChange={(v) =>
                      update.mutate({
                        id: app.id,
                        socio_id: socioId,
                        patch: { status: v as AidApplicationStatus },
                      })
                    }
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AID_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() =>
                      archive.mutate({ id: app.id, socio_id: socioId })
                    }
                  >
                    Archivar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}