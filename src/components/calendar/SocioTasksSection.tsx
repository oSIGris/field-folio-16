import { useState } from "react";
import { Plus, Loader2, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  OPEN_TASK_STATUSES,
  useArchiveTask,
  useTasks,
  useUpdateTaskStatus,
  type Task,
} from "@/lib/calendar/use-tasks";
import { TaskRow } from "./TaskList";
import { TaskDialog } from "./TaskDialog";

export function SocioTasksSection({
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
  const { data: tasks = [], isLoading } = useTasks(cooperativeId, socioId);
  const setStatus = useUpdateTaskStatus(cooperativeId, userId);
  const archive = useArchiveTask(cooperativeId, userId);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const openTasks = tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
  const doneTasks = tasks.filter((t) => !OPEN_TASK_STATUSES.includes(t.status));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          Tareas y vencimientos
        </h3>
        {canEdit && (
          <Button
            size="sm"
            className="h-7"
            onClick={() => {
              setEditTask(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Nueva tarea
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
        </div>
      ) : tasks.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
          Este socio no tiene tareas vinculadas.
        </p>
      ) : (
        <div className="space-y-1.5">
          {[...openTasks, ...doneTasks].map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              canEdit={canEdit}
              onEdit={(x) => {
                setEditTask(x);
                setOpen(true);
              }}
              onStatus={(id, s) => setStatus.mutate({ id, status: s })}
              onArchive={(id) => archive.mutate(id)}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={open}
        onOpenChange={setOpen}
        cooperativeId={cooperativeId}
        userId={userId}
        task={editTask}
        lockedSocioId={socioId}
      />
    </div>
  );
}