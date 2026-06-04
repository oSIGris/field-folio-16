import { useMemo, useState } from "react";
import { CalendarPlus, ListPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmtDateTime, isOverdue } from "@/lib/calendar/format";
import {
  OPEN_TASK_STATUSES,
  useArchiveTask,
  useTasks,
  useUpdateTaskStatus,
  type Task,
} from "@/lib/calendar/use-tasks";
import { eventTypeLabel, useEvents } from "@/lib/calendar/use-events";
import { TaskRow } from "./TaskList";
import { TaskDialog } from "./TaskDialog";
import { EventDialog } from "./EventDialog";
import { EVENT_TONE } from "./tones";

export function AgendaTab({
  cooperativeId,
  userId,
  canEdit,
}: {
  cooperativeId: string;
  userId: string;
  canEdit: boolean;
}) {
  const { data: tasks = [], isLoading } = useTasks(cooperativeId);
  const { data: events = [] } = useEvents(cooperativeId);
  const setStatus = useUpdateTaskStatus(cooperativeId, userId);
  const archive = useArchiveTask(cooperativeId, userId);

  const [taskOpen, setTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [eventOpen, setEventOpen] = useState(false);

  const { overdue, pending } = useMemo(() => {
    const open = tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
    return {
      overdue: open.filter((t) => isOverdue(t.due_date)),
      pending: open.filter((t) => !isOverdue(t.due_date)),
    };
  }, [tasks]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.starts_at).getTime() >= now - 86_400_000)
      .slice(0, 12);
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando agenda…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {canEdit && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setEditTask(null);
              setTaskOpen(true);
            }}
          >
            <ListPlus className="mr-1.5 h-4 w-4" /> Nueva tarea
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEventOpen(true)}>
            <CalendarPlus className="mr-1.5 h-4 w-4" /> Nuevo evento
          </Button>
        </div>
      )}

      <Section title="Tareas vencidas" count={overdue.length} accent>
        {overdue.length === 0 ? (
          <Empty>No hay tareas vencidas.</Empty>
        ) : (
          overdue.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              canEdit={canEdit}
              onEdit={(x) => {
                setEditTask(x);
                setTaskOpen(true);
              }}
              onStatus={(id, s) => setStatus.mutate({ id, status: s })}
              onArchive={(id) => archive.mutate(id)}
            />
          ))
        )}
      </Section>

      <Section title="Tareas pendientes" count={pending.length}>
        {pending.length === 0 ? (
          <Empty>No hay tareas pendientes.</Empty>
        ) : (
          pending.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              canEdit={canEdit}
              onEdit={(x) => {
                setEditTask(x);
                setTaskOpen(true);
              }}
              onStatus={(id, s) => setStatus.mutate({ id, status: s })}
              onArchive={(id) => archive.mutate(id)}
            />
          ))
        )}
      </Section>

      <Section title="Próximos eventos" count={upcomingEvents.length}>
        {upcomingEvents.length === 0 ? (
          <Empty>No hay eventos próximos.</Empty>
        ) : (
          upcomingEvents.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
            >
              <Badge className={cn("h-5 px-1.5", EVENT_TONE[e.event_type])}>
                {eventTypeLabel(e.event_type)}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {e.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {e.all_day ? "Todo el día" : fmtDateTime(e.starts_at)}
              </span>
            </div>
          ))
        )}
      </Section>

      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        cooperativeId={cooperativeId}
        userId={userId}
        task={editTask}
      />
      <EventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        cooperativeId={cooperativeId}
        userId={userId}
      />
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3
          className={cn(
            "text-sm font-semibold",
            accent && count > 0 && "text-destructive",
          )}
        >
          {title}
        </h3>
        <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
      {children}
    </p>
  );
}