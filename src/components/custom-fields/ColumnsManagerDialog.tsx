import { useState } from "react";
import { Archive, ArchiveRestore, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_FIELD_TYPES,
  parseOptions,
  toFieldKey,
  useArchiveCustomField,
  useCustomFields,
  useSaveCustomField,
  type CustomField,
  type CustomFieldOption,
  type CustomFieldType,
} from "@/lib/custom-fields/use-custom-fields";

interface Props {
  open: boolean;
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Draft {
  id?: string;
  name: string;
  field_type: CustomFieldType;
  options: CustomFieldOption[];
  required: boolean;
  visible: boolean;
  description: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  field_type: "text",
  options: [],
  required: false,
  visible: true,
  description: "",
};

const needsOptions = (t: CustomFieldType) =>
  t === "select" || t === "multiselect";

export function ColumnsManagerDialog({
  open,
  cooperativeId,
  userId,
  canEdit,
  onOpenChange,
}: Props) {
  const { data: fields = [] } = useCustomFields(cooperativeId, "socio", true);
  const saveField = useSaveCustomField(cooperativeId, userId);
  const archiveField = useArchiveCustomField(cooperativeId, userId);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [optionInput, setOptionInput] = useState("");

  const active = fields.filter((f) => !f.archived_at);
  const archived = fields.filter((f) => f.archived_at);

  const startNew = () => {
    setDraft({ ...EMPTY_DRAFT });
    setOptionInput("");
  };

  const startEdit = (f: CustomField) => {
    setDraft({
      id: f.id,
      name: f.name,
      field_type: f.field_type,
      options: parseOptions(f.options),
      required: f.required,
      visible: f.visible,
      description: f.description ?? "",
    });
    setOptionInput("");
  };

  const addOption = () => {
    const v = optionInput.trim();
    if (!v || !draft) return;
    if (draft.options.some((o) => o.value === v)) return;
    setDraft({ ...draft, options: [...draft.options, { value: v, label: v }] });
    setOptionInput("");
  };

  const handleSave = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (needsOptions(draft.field_type) && draft.options.length === 0) {
      toast.error("Añade al menos una opción");
      return;
    }
    saveField.mutate(
      {
        id: draft.id,
        scope: "socio",
        name: draft.name.trim(),
        key: draft.id ? "" : toFieldKey(draft.name),
        field_type: draft.field_type,
        options: needsOptions(draft.field_type) ? draft.options : [],
        required: draft.required,
        visible: draft.visible,
        description: draft.description.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(draft.id ? "Columna actualizada" : "Columna creada");
          setDraft(null);
        },
        onError: (e) =>
          toast.error("No se pudo guardar", {
            description: (e as Error).message,
          }),
      },
    );
  };

  const handleArchive = (f: CustomField, archived: boolean) => {
    archiveField.mutate(
      { id: f.id, archived },
      {
        onSuccess: () =>
          toast.success(archived ? "Columna archivada" : "Columna restaurada"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Columnas ERP</DialogTitle>
          <DialogDescription>
            Crea columnas personalizadas para la tabla de socios. No se eliminan
            físicamente; se archivan para conservar el histórico.
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
            <div className="space-y-1">
              <Label>Nombre de la columna</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ej. Superficie SIGPAC"
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo de dato</Label>
              <Select
                value={draft.field_type}
                onValueChange={(v) =>
                  setDraft({ ...draft, field_type: v as CustomFieldType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOM_FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsOptions(draft.field_type) && (
              <div className="space-y-1">
                <Label>Opciones</Label>
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Nueva opción"
                  />
                  <Button type="button" variant="outline" onClick={addOption}>
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {draft.options.map((o) => (
                    <Badge key={o.value} variant="secondary" className="gap-1">
                      {o.label}
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            options: draft.options.filter(
                              (x) => x.value !== o.value,
                            ),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label>Descripción interna</Label>
              <Textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                className="min-h-16"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={draft.required}
                  onCheckedChange={(c) =>
                    setDraft({ ...draft, required: !!c })
                  }
                />
                Obligatoria
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={draft.visible}
                  onCheckedChange={(c) => setDraft({ ...draft, visible: !!c })}
                />
                Visible en la tabla
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saveField.isPending}>
                {draft.id ? "Guardar" : "Crear columna"}
              </Button>
            </div>
          </div>
        ) : (
          canEdit && (
            <Button className="gap-1.5" onClick={startNew}>
              <Plus className="h-4 w-4" />
              Nueva columna
            </Button>
          )
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Columnas activas ({active.length})
          </h3>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay columnas personalizadas.
            </p>
          ) : (
            active.map((f) => (
              <FieldRow
                key={f.id}
                field={f}
                canEdit={canEdit}
                onEdit={() => startEdit(f)}
                onArchive={() => handleArchive(f, true)}
              />
            ))
          )}
        </div>

        {archived.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Archivadas ({archived.length})
            </h3>
            {archived.map((f) => (
              <FieldRow
                key={f.id}
                field={f}
                canEdit={canEdit}
                archived
                onRestore={() => handleArchive(f, false)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  field,
  canEdit,
  archived,
  onEdit,
  onArchive,
  onRestore,
}: {
  field: CustomField;
  canEdit: boolean;
  archived?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  const typeLabel = CUSTOM_FIELD_TYPES.find(
    (t) => t.value === field.field_type,
  )?.label;
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{field.name}</span>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {typeLabel}
          </Badge>
          {field.required && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Obligatoria
            </Badge>
          )}
          {!field.visible && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Oculta
            </Badge>
          )}
        </div>
        {field.description && (
          <p className="truncate text-xs text-muted-foreground">
            {field.description}
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