import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LayoutGrid,
  Table2,
  Columns3,
  Search,
  Plus,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socioDisplayName, type Socio } from "@/lib/socios/socios-fields";
import { useCreateSocio } from "@/lib/socios/use-socios";
import { SociosGrid } from "./SociosGrid";
import { SocioCard } from "./SocioCard";
import { SocioDrawer } from "./SocioDrawer";

type View = "table" | "cards" | "board";

const VIEWS: { id: View; label: string; icon: typeof Table2 }[] = [
  { id: "table", label: "Tabla", icon: Table2 },
  { id: "cards", label: "Tarjetas", icon: LayoutGrid },
  { id: "board", label: "Tablero", icon: Columns3 },
];

function matchesQuery(s: Socio, q: string) {
  if (!q) return true;
  const haystack = [
    socioDisplayName(s),
    s.codigo_socio,
    s.nif,
    s.email,
    s.telefono,
    s.municipio,
    s.provincia,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

export function SociosWorkspace({
  rows,
  cooperativeId,
  canEdit,
  userId,
}: {
  rows: Socio[];
  cooperativeId: string;
  canEdit: boolean;
  userId: string;
}) {
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [drawerSocio, setDrawerSocio] = useState<Socio | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const createMutation = useCreateSocio(cooperativeId);

  const metrics = useMemo(() => {
    const activos = rows.filter((r) => r.activo).length;
    return { total: rows.length, activos, bajas: rows.length - activos };
  }, [rows]);

  const filtered = useMemo(
    () => rows.filter((r) => matchesQuery(r, query)),
    [rows, query],
  );

  const openDrawer = (s: Socio) => {
    setDrawerSocio(s);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate(userId, {
      onSuccess: (socio) => {
        toast.success("Socio creado");
        openDrawer(socio);
      },
      onError: (e) =>
        toast.error("No se pudo crear el socio", {
          description: (e as Error).message,
        }),
    });
  };

  const metricCards = [
    { label: "Total", value: metrics.total, icon: Users, tone: "text-primary" },
    { label: "Activos", value: metrics.activos, icon: UserCheck, tone: "text-success" },
    { label: "Bajas", value: metrics.bajas, icon: UserMinus, tone: "text-muted-foreground" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header: title + metrics + view switcher */}
      <div className="flex flex-wrap items-center gap-4 border-b bg-card px-4 py-3">
        <div className="mr-auto">
          <h1 className="text-lg font-semibold tracking-tight">Socios</h1>
          <p className="text-xs text-muted-foreground">
            Gestiona el censo de la cooperativa
          </p>
        </div>

        <div className="flex items-center gap-2">
          {metricCards.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5"
            >
              <m.icon className={cn("h-4 w-4", m.tone)} />
              <div className="leading-none">
                <div className="text-sm font-semibold tabular-nums">{m.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                view === v.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {view === "table" ? (
        <div className="min-h-0 flex-1">
          <SociosGrid
            rows={rows}
            cooperativeId={cooperativeId}
            canEdit={canEdit}
            userId={userId}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b bg-card px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar socios…"
                className="h-9 w-64 pl-8"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {filtered.length} de {rows.length}
            </span>
            {canEdit && (
              <Button
                size="sm"
                className="ml-auto h-9 gap-1.5"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                Nuevo socio
              </Button>
            )}
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No hay socios que coincidan con la búsqueda.
              </div>
            ) : view === "cards" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((s) => (
                  <SocioCard key={s.id} socio={s} onOpen={openDrawer} />
                ))}
              </div>
            ) : (
              <BoardView rows={filtered} onOpen={openDrawer} />
            )}
          </div>
        </>
      )}

      <SocioDrawer
        socio={drawerSocio}
        open={drawerOpen}
        canEdit={canEdit}
        cooperativeId={cooperativeId}
        onOpenChange={setDrawerOpen}
        onSaved={() => {}}
      />
    </div>
  );
}

function BoardView({
  rows,
  onOpen,
}: {
  rows: Socio[];
  onOpen: (s: Socio) => void;
}) {
  const columns = [
    {
      id: "activos",
      label: "Activos",
      accent: "bg-success",
      items: rows.filter((r) => r.activo),
    },
    {
      id: "bajas",
      label: "Bajas",
      accent: "bg-muted-foreground",
      items: rows.filter((r) => !r.activo),
    },
  ];

  return (
    <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2">
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col rounded-xl border bg-secondary/40">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <span className={cn("h-2 w-2 rounded-full", col.accent)} />
            <span className="text-sm font-semibold">{col.label}</span>
            <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {col.items.length}
            </span>
          </div>
          <div className="scrollbar-thin space-y-2.5 overflow-auto p-3">
            {col.items.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Sin socios
              </p>
            ) : (
              col.items.map((s) => (
                <SocioCard key={s.id} socio={s} onOpen={onOpen} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}