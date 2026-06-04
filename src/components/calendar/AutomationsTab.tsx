import { useState } from "react";
import { Pause, Play, Plus, Archive, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  RULE_STATUS_LABEL,
  RULE_TEMPLATES,
  ruleTemplate,
  useAutomationRules,
  useSaveRule,
  useSetRuleStatus,
  type AutomationRuleType,
} from "@/lib/automations/use-automations";

export function AutomationsTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: rules = [] } = useAutomationRules(cooperativeId);
  const save = useSaveRule(cooperativeId, userId);
  const setStatus = useSetRuleStatus(cooperativeId, userId);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AutomationRuleType>("avisar_antes");
  const [name, setName] = useState("");
  const [days, setDays] = useState(7);
  const [draft, setDraft] = useState(false);

  const tpl = ruleTemplate(type);

  const openNew = () => {
    setType("avisar_antes");
    setName("");
    setDays(7);
    setDraft(false);
    setOpen(true);
  };

  const pickType = (t: AutomationRuleType) => {
    setType(t);
    const d = ruleTemplate(t);
    if (d) setDays(d.defaultDays);
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Pon un nombre a la regla");
      return;
    }
    try {
      await save.mutateAsync({
        name: name.trim(),
        rule_type: type,
        days_before: tpl?.usesDays ? days : 0,
        create_email_draft: draft,
      });
      toast.success("Regla creada");
      setOpen(false);
    } catch (e) {
      toast.error("No se pudo crear", { description: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Las reglas preparan avisos internos. No se envía nada automáticamente.
        </p>
        {canEdit && (
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Nueva regla
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {rules.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
            Sin reglas todavía. Crea una desde una plantilla guiada.
          </p>
        ) : (
          rules.map((r) => {
            const t = ruleTemplate(r.rule_type);
            return (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-md border bg-card px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{r.name}</span>
                    <Badge
                      className={cn(
                        "h-5 px-1.5",
                        r.status === "activa"
                          ? "bg-success/20 text-success"
                          : r.status === "pausada"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {RULE_STATUS_LABEL[r.status]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t?.label}
                    {t?.usesDays ? ` · ${r.days_before} días` : ""}
                    {r.create_email_draft ? " · crea borrador" : ""}
                  </p>
                </div>
                {canEdit && r.status !== "archivada" && (
                  <div className="flex shrink-0 items-center gap-1">
                    {r.status === "activa" ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Pausar"
                        onClick={() =>
                          setStatus.mutate({ id: r.id, status: "pausada" })
                        }
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-success"
                        title="Activar"
                        onClick={() =>
                          setStatus.mutate({ id: r.id, status: "activa" })
                        }
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      title="Archivar"
                      onClick={() =>
                        setStatus.mutate({ id: r.id, status: "archivada" })
                      }
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva automatización guiada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Plantilla</Label>
              <Select value={type} onValueChange={(v) => pickType(v as AutomationRuleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TEMPLATES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tpl && (
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="r-name">Nombre de la regla</Label>
              <Input
                id="r-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Aviso 7 días antes de vencimiento"
              />
            </div>
            {tpl?.usesDays && (
              <div className="space-y-1">
                <Label htmlFor="r-days">Días de antelación</Label>
                <Input
                  id="r-days"
                  type="number"
                  min={0}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value) || 0)}
                />
              </div>
            )}
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Canal: notificación interna
            </div>
            <label className="flex items-center gap-2">
              <Checkbox checked={draft} onCheckedChange={(c) => setDraft(!!c)} />
              <span className="text-sm">
                Crear borrador de correo (no se enviará automáticamente)
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending ? "Creando..." : "Crear regla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}