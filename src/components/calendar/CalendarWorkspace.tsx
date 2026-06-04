import { useMemo } from "react";
import { ListTodo, AlertTriangle, Workflow, FileText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isOverdue } from "@/lib/calendar/format";
import { OPEN_TASK_STATUSES, useTasks } from "@/lib/calendar/use-tasks";
import { useAutomationRules } from "@/lib/automations/use-automations";
import { useEmailDrafts } from "@/lib/emails/use-emails";
import { AgendaTab } from "./AgendaTab";
import { AutomationsTab } from "./AutomationsTab";
import { EmailsTab } from "./EmailsTab";
import { CopilotTab } from "./CopilotTab";

export function CalendarWorkspace({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: tasks = [] } = useTasks(cooperativeId);
  const { data: rules = [] } = useAutomationRules(cooperativeId);
  const { data: drafts = [] } = useEmailDrafts(cooperativeId);

  const metrics = useMemo(() => {
    const open = tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
    return {
      pending: open.length,
      overdue: open.filter((t) => isOverdue(t.due_date)).length,
      activeRules: rules.filter((r) => r.status === "activa").length,
      drafts: drafts.filter((d) => d.status === "draft").length,
    };
  }, [tasks, rules, drafts]);

  const cards = [
    { label: "Pendientes", value: metrics.pending, icon: ListTodo },
    {
      label: "Vencidas",
      value: metrics.overdue,
      icon: AlertTriangle,
      accent: metrics.overdue > 0,
    },
    { label: "Reglas activas", value: metrics.activeRules, icon: Workflow },
    { label: "Borradores", value: metrics.drafts, icon: FileText },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Agenda, automatizaciones, correos y copiloto IA
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-lg border bg-card p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div
                className={
                  "mt-1 text-2xl font-semibold tabular-nums" +
                  (c.accent ? " text-destructive" : "")
                }
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="agenda" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-6 pt-3">
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="automatizaciones">Automatizaciones</TabsTrigger>
            <TabsTrigger value="correos">Correos</TabsTrigger>
            <TabsTrigger value="copiloto">Copiloto IA</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <TabsContent value="agenda" className="mt-0">
            <AgendaTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="automatizaciones" className="mt-0">
            <AutomationsTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="correos" className="mt-0">
            <EmailsTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="copiloto" className="mt-0">
            <CopilotTab
              cooperativeId={cooperativeId}
              userId={userId}
              canEdit={canEdit}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}