import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { useSocios } from "@/lib/socios/use-socios";
import { SociosGrid } from "@/components/socios/SociosGrid";

export const Route = createFileRoute("/_authenticated/socios")({
  component: SociosPage,
});

function SociosPage() {
  const { user } = useAuth();
  const { cooperativeId, canEdit } = useWorkspace();
  const { data, isLoading, isError, error } = useSocios(cooperativeId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando socios…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <SociosGrid
      rows={data ?? []}
      cooperativeId={cooperativeId}
      canEdit={canEdit}
      userId={user!.id}
    />
  );
}