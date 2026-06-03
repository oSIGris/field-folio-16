import { useState } from "react";
import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useAidCampaigns,
  useAidTypes,
  useArchiveAidType,
  useArchiveCampaign,
  useSaveAidType,
  useSaveCampaign,
  type AidCampaign,
  type AidType,
} from "@/lib/aids/use-aids";

interface Props {
  open: boolean;
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AidsManagerDialog({
  open,
  cooperativeId,
  userId,
  canEdit,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ayudas</DialogTitle>
          <DialogDescription>
            Gestiona campañas (p. ej. PAC 2026) y tipos de ayuda. Los elementos
            no se eliminan, se archivan.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="campaigns">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
            <TabsTrigger value="types">Tipos de ayuda</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns">
            <CampaignsTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="types">
            <TypesTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: campaigns = [] } = useAidCampaigns(cooperativeId, true);
  const save = useSaveCampaign(cooperativeId, userId);
  const archive = useArchiveCampaign(cooperativeId, userId);

  const [draft, setDraft] = useState<{
    id?: string;
    name: string;
    year: string;
    starts_on: string;
    ends_on: string;
  } | null>(null);

  const active = campaigns.filter((c) => !c.archived_at);
  const archived = campaigns.filter((c) => c.archived_at);

  const handleSave = () => {
    if (!draft?.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    save.mutate(
      {
        id: draft.id,
        name: draft.name.trim(),
        year: draft.year ? Number(draft.year) : null,
        starts_on: draft.starts_on || null,
        ends_on: draft.ends_on || null,
      },
      {
        onSuccess: () => {
          toast.success("Campaña guardada");
          setDraft(null);
        },
        onError: (e) =>
          toast.error("No se pudo guardar", {
            description: (e as Error).message,
          }),
      },
    );
  };

  return (
    <div className="space-y-3 pt-3">
      {draft ? (
        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="PAC 2026"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Año</Label>
              <Input
                type="number"
                value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Inicio</Label>
              <Input
                type="date"
                value={draft.starts_on}
                onChange={(e) =>
                  setDraft({ ...draft, starts_on: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Fin</Label>
              <Input
                type="date"
                value={draft.ends_on}
                onChange={(e) => setDraft({ ...draft, ends_on: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={save.isPending}>
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        canEdit && (
          <Button
            className="gap-1.5"
            onClick={() =>
              setDraft({ name: "", year: "", starts_on: "", ends_on: "" })
            }
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </Button>
        )
      )}

      {active.map((c) => (
        <CampaignRow
          key={c.id}
          campaign={c}
          canEdit={canEdit}
          onEdit={() =>
            setDraft({
              id: c.id,
              name: c.name,
              year: c.year ? String(c.year) : "",
              starts_on: c.starts_on ?? "",
              ends_on: c.ends_on ?? "",
            })
          }
          onArchive={() => archive.mutate({ id: c.id, archived: true })}
        />
      ))}
      {active.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin campañas activas.</p>
      )}

      {archived.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Archivadas
          </h4>
          {archived.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              canEdit={canEdit}
              archived
              onRestore={() => archive.mutate({ id: c.id, archived: false })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  canEdit,
  archived,
  onEdit,
  onArchive,
  onRestore,
}: {
  campaign: AidCampaign;
  canEdit: boolean;
  archived?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{campaign.name}</span>
          {campaign.year && (
            <Badge variant="outline" className="text-[10px]">
              {campaign.year}
            </Badge>
          )}
        </div>
        {(campaign.starts_on || campaign.ends_on) && (
          <p className="text-xs text-muted-foreground">
            {campaign.starts_on ?? "?"} → {campaign.ends_on ?? "?"}
          </p>
        )}
      </div>
      {canEdit &&
        (archived ? (
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRestore}>
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restaurar
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={onArchive}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </>
        ))}
    </div>
  );
}

function TypesTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: types = [] } = useAidTypes(cooperativeId, true);
  const save = useSaveAidType(cooperativeId, userId);
  const archive = useArchiveAidType(cooperativeId, userId);

  const [draft, setDraft] = useState<{
    id?: string;
    code: string;
    name: string;
    description: string;
  } | null>(null);

  const active = types.filter((t) => !t.archived_at);
  const archived = types.filter((t) => t.archived_at);

  const handleSave = () => {
    if (!draft?.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    save.mutate(
      {
        id: draft.id,
        code: draft.code.trim() || null,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Tipo de ayuda guardado");
          setDraft(null);
        },
        onError: (e) =>
          toast.error("No se pudo guardar", {
            description: (e as Error).message,
          }),
      },
    );
  };

  return (
    <div className="space-y-3 pt-3">
      {draft ? (
        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Código</Label>
              <Input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Nombre</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              className="min-h-16"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={save.isPending}>
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        canEdit && (
          <Button
            className="gap-1.5"
            onClick={() =>
              setDraft({ code: "", name: "", description: "" })
            }
          >
            <Plus className="h-4 w-4" />
            Nuevo tipo
          </Button>
        )
      )}

      {active.map((t) => (
        <TypeRow
          key={t.id}
          type={t}
          canEdit={canEdit}
          onEdit={() =>
            setDraft({
              id: t.id,
              code: t.code ?? "",
              name: t.name,
              description: t.description ?? "",
            })
          }
          onArchive={() => archive.mutate({ id: t.id, archived: true })}
        />
      ))}
      {active.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin tipos de ayuda.</p>
      )}

      {archived.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Archivados
          </h4>
          {archived.map((t) => (
            <TypeRow
              key={t.id}
              type={t}
              canEdit={canEdit}
              archived
              onRestore={() => archive.mutate({ id: t.id, archived: false })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TypeRow({
  type,
  canEdit,
  archived,
  onEdit,
  onArchive,
  onRestore,
}: {
  type: AidType;
  canEdit: boolean;
  archived?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {type.code && (
            <Badge variant="outline" className="text-[10px]">
              {type.code}
            </Badge>
          )}
          <span className="truncate text-sm font-medium">{type.name}</span>
        </div>
        {type.description && (
          <p className="truncate text-xs text-muted-foreground">
            {type.description}
          </p>
        )}
      </div>
      {canEdit &&
        (archived ? (
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRestore}>
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restaurar
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={onArchive}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </>
        ))}
    </div>
  );
}