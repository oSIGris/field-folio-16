import { createFileRoute } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth/auth-context";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { useSocios } from "@/lib/socios/use-socios";
import { SociosWorkspace } from "@/components/socios/SociosWorkspace";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/socios")({
  component: SociosPage,
});

function SociosPage() {
  const { user } = useAuth();
  const { cooperativeId, canEdit } = useWorkspace();
  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage } =
    useSocios(cooperativeId);

  if (isLoading) {
    return <SociosSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <SociosWorkspace
      rows={data ?? []}
      cooperativeId={cooperativeId}
      canEdit={canEdit}
      userId={user!.id}
      loadingMore={hasNextPage || isFetchingNextPage}
    />
  );
}

function SociosSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b bg-card px-4 py-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="ml-auto h-8 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="flex items-center gap-2 border-b bg-card px-3 py-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="min-h-0 flex-1 space-y-1.5 p-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    </div>
  );
}