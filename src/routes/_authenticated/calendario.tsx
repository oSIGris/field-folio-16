import { createFileRoute } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth/auth-context";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";

export const Route = createFileRoute("/_authenticated/calendario")({
  component: CalendarioPage,
});

function CalendarioPage() {
  const { user } = useAuth();
  const { cooperativeId, canEdit } = useWorkspace();

  return (
    <CalendarWorkspace
      cooperativeId={cooperativeId}
      userId={user!.id}
      canEdit={canEdit}
    />
  );
}