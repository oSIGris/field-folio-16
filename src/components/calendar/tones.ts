import type { TaskPriority, TaskStatus } from "@/lib/calendar/use-tasks";
import type { CalendarEventType } from "@/lib/calendar/use-events";
import type { EmailDraftStatus } from "@/lib/emails/use-emails";
import type { AiProposalStatus } from "@/lib/ai/use-copilot";

export const PRIORITY_TONE: Record<TaskPriority, string> = {
  baja: "bg-muted text-muted-foreground",
  normal: "bg-primary/10 text-primary",
  alta: "bg-warning/20 text-warning-foreground",
  urgente: "bg-destructive/15 text-destructive",
};

export const STATUS_TONE: Record<TaskStatus, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_curso: "bg-primary/10 text-primary",
  bloqueada: "bg-warning/20 text-warning-foreground",
  hecha: "bg-success/20 text-success",
  cancelada: "bg-muted text-muted-foreground line-through",
};

export const EVENT_TONE: Record<CalendarEventType, string> = {
  vencimiento: "bg-destructive/15 text-destructive",
  recordatorio: "bg-primary/10 text-primary",
  cita: "bg-success/20 text-success",
  llamada: "bg-warning/20 text-warning-foreground",
  interno: "bg-muted text-muted-foreground",
};

export const EMAIL_TONE: Record<EmailDraftStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning/20 text-warning-foreground",
  approved: "bg-primary/10 text-primary",
  cancelled: "bg-muted text-muted-foreground line-through",
  sent: "bg-success/20 text-success",
};

export const PROPOSAL_TONE: Record<AiProposalStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  accepted: "bg-success/20 text-success",
  rejected: "bg-destructive/15 text-destructive",
  executed: "bg-primary/10 text-primary",
};