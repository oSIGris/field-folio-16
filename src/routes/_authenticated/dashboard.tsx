import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserMinus, Building2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/lib/workspace/workspace-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function useSocioMetrics(cooperativeId: string) {
  return useQuery({
    queryKey: ["socio-metrics", cooperativeId],
    enabled: !!cooperativeId,
    queryFn: async () => {
      const base = supabase
        .from("socios")
        .select("*", { count: "exact", head: true })
        .eq("cooperative_id", cooperativeId);
      const [total, activos] = await Promise.all([
        base,
        supabase
          .from("socios")
          .select("*", { count: "exact", head: true })
          .eq("cooperative_id", cooperativeId)
          .eq("activo", true),
      ]);
      if (total.error) throw total.error;
      if (activos.error) throw activos.error;
      const totalCount = total.count ?? 0;
      const activosCount = activos.count ?? 0;
      return { totalCount, activosCount, bajasCount: totalCount - activosCount };
    },
  });
}

function DashboardPage() {
  const { cooperative, cooperativeId } = useWorkspace();
  const { data } = useSocioMetrics(cooperativeId);

  const cards = [
    { label: "Socios totales", value: data?.totalCount ?? 0, icon: Users },
    { label: "Socios activos", value: data?.activosCount ?? 0, icon: UserCheck },
    { label: "Bajas", value: data?.bajasCount ?? 0, icon: UserMinus },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{cooperative.nombre}</h1>
          <p className="text-sm text-muted-foreground">Panel administrativo</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}