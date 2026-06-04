import { Check, Pencil, Archive } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtDate, isOverdue } from "@/lib/calendar/format";
import {
  TASK_STATUSES,
  taskPriorityLabel,
  taskStatusLabel,
  type Task,
  type TaskStatus,
} from "@/lib/calendar/use-tasks";
import { PRIORITY_TONE, STATUS_TONE } from "./tones";

export function TaskRow({
  task,
  canEdit,
  onEdit,
  onStatus,
  onArchive,
}: {
  task: Task;
  canEdit: boolean;
  onEdit?: (t: Task) => void;
  onStatus: (id: string, status: TaskStatus) => void;
  onArchive?: (id: string) => void;
}) {
  const overdue =
    isOverdue(task.due_date) &&
    task.status !== "hecha" &&
    task.status !== "cancelada";
  return (
    <div className="flex items-start gap-3 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{task.title}</span>
          <Badge className={cn("h-5 px-1.5", PRIORITY_TONE[task.priority])}>
            {taskPriorityLabel(task.priority)}
          </Badge>
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className={cn(overdue && "font-medium text-destructive")}>
            {task.due_date ? `Vence ${fmtDate(task.due_date)}` : "Sin fecha"}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {canEdit ? (
          <Select
            value={task.status}
            onValueChange={(v) => onStatus(task.id, v as TaskStatus)}
          >
            <SelectTrigger className="h-7 w-32 text-xs">
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
        ) : (
          <Badge className={cn("h-6", STATUS_TONE[task.status])}>
            {taskStatusLabel(task.status)}
          </Badge>
        )}
        {canEdit && onEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {canEdit && task.status !== "hecha" && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-success"
            title="Marcar hecha"
            onClick={() => onStatus(task.id, "hecha")}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        {canEdit && onArchive && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground"
            title="Archivar"
            onClick={() => onArchive(task.id)}
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}