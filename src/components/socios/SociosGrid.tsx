import { useCallback, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  PanelRightOpen,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SOCIO_FIELDS,
  type Socio,
} from "@/lib/socios/socios-fields";
import {
  useDeleteSocios,
  useSaveSocios,
} from "@/lib/socios/use-socios";
import { EditableCell } from "./EditableCell";
import { SocioDrawer } from "./SocioDrawer";
import { NuevoSocioDialog } from "./NuevoSocioDialog";
import type { GridMeta } from "./grid-types";

const ROW_HEIGHT = 30;

export function SociosGrid({
  rows,
  cooperativeId,
  canEdit,
  userId,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  columnVisibility,
  onColumnVisibilityChange,
  showFilters,
  onShowFiltersChange,
}: {
  rows: Socio[];
  cooperativeId: string;
  canEdit: boolean;
  userId: string;
  sorting: SortingState;
  onSortingChange: (u: React.SetStateAction<SortingState>) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (u: React.SetStateAction<ColumnFiltersState>) => void;
  globalFilter: string;
  onGlobalFilterChange: (u: React.SetStateAction<string>) => void;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (u: React.SetStateAction<VisibilityState>) => void;
  showFilters: boolean;
  onShowFiltersChange: (u: React.SetStateAction<boolean>) => void;
}) {
  const [edits, setEdits] = useState<Record<string, Partial<Socio>>>({});
  const editsRef = useRef(edits);
  editsRef.current = edits;

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [drawerSocio, setDrawerSocio] = useState<Socio | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const rowsById = useMemo(() => {
    const map = new Map<string, Socio>();
    for (const r of rows) map.set(r.id, r);
    return map;
  }, [rows]);

  const saveMutation = useSaveSocios(cooperativeId);
  const deleteMutation = useDeleteSocios(cooperativeId);

  const getCellValue = useCallback(
    (id: string, key: keyof Socio) => {
      const e = editsRef.current[id];
      if (e && key in e) return e[key];
      return rowsById.get(id)?.[key];
    },
    [rowsById],
  );

  const setCellValue = useCallback(
    (id: string, key: keyof Socio, value: unknown) => {
      setEdits((prev) => {
        const original = rowsById.get(id)?.[key];
        const next = { ...prev };
        const cur = { ...(next[id] ?? {}) };
        if (value === original) {
          delete cur[key];
        } else {
          (cur as Record<string, unknown>)[key as string] = value;
        }
        if (Object.keys(cur).length === 0) delete next[id];
        else next[id] = cur;
        return next;
      });
    },
    [rowsById],
  );

  const isCellDirty = useCallback((id: string, key: keyof Socio) => {
    const e = editsRef.current[id];
    return !!e && key in e;
  }, []);

  const openDrawer = useCallback((socio: Socio) => {
    setDrawerSocio(socio);
    setDrawerOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Socio>[]>(() => {
    const selectCol: ColumnDef<Socio> = {
      id: "select",
      size: 36,
      enableResizing: false,
      enableSorting: false,
      header: ({ table }) => (
        <div className="flex h-full items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllRowsSelected()
                ? true
                : table.getIsSomeRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(c) => table.toggleAllRowsSelected(!!c)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-full items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(c) => row.toggleSelected(!!c)}
          />
        </div>
      ),
    };

    const fieldCols: ColumnDef<Socio>[] = SOCIO_FIELDS.map((field) => ({
      id: field.key as string,
      accessorFn: (row) => {
        const e = editsRef.current[row.id];
        return e && field.key in e ? e[field.key] : row[field.key];
      },
      header: field.label,
      size: field.width,
      minSize: 60,
      filterFn:
        field.type === "boolean"
          ? (row, id, value) => {
              if (!value || value === "all") return true;
              return String(row.getValue(id)) === value;
            }
          : "includesString",
      cell: (ctx) => <EditableCell cell={ctx} field={field} />,
    }));

    const actionsCol: ColumnDef<Socio> = {
      id: "actions",
      size: 44,
      enableResizing: false,
      enableSorting: false,
      header: "",
      cell: ({ row, table }) => (
        <div className="flex h-full items-center justify-center">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => (table.options.meta as GridMeta).openDrawer(row.original)}
            title="Abrir ficha"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        </div>
      ),
    };

    return [selectCol, ...fieldCols, actionsCol];
  }, []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection },
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      canEdit,
      getCellValue,
      setCellValue,
      isCellDirty,
      openDrawer,
    } satisfies GridMeta,
  });

  const { rows: tableRows } = table.getRowModel();
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
  });

  const totalWidth = table.getTotalSize();
  const pendingCount = Object.keys(edits).length;
  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const handleSave = () => {
    if (pendingCount === 0) return;
    saveMutation.mutate(edits, {
      onSuccess: (n) => {
        setEdits({});
        toast.success(`${n} socio(s) guardado(s)`);
      },
      onError: (e) =>
        toast.error("No se pudieron guardar los cambios", {
          description: (e as Error).message,
        }),
    });
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    deleteMutation.mutate(selectedIds, {
      onSuccess: (n) => {
        setRowSelection({});
        toast.success(`${n} socio(s) eliminado(s)`);
      },
      onError: (e) =>
        toast.error("No se pudieron eliminar", { description: (e as Error).message }),
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-card px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Buscar…"
            className="h-8 w-56 pl-8"
          />
        </div>

        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => onShowFiltersChange((s: boolean) => !s)}
        >
          Filtros
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Columns3 className="h-3.5 w-3.5" />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 w-52 overflow-auto">
            <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllLeafColumns()
              .filter((c) => c.id !== "select" && c.id !== "actions")
              .map((column) => {
                const field = SOCIO_FIELDS.find((f) => f.key === column.id);
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {field?.label ?? column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          {selectedIds.length > 0 && canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar ({selectedIds.length})
            </Button>
          )}

          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setEdits({})}
            >
              <X className="h-3.5 w-3.5" />
              Descartar
            </Button>
          )}

          {canEdit && (
            <Button
              size="sm"
              variant={pendingCount > 0 ? "default" : "outline"}
              className="h-8 gap-1.5"
              onClick={handleSave}
              disabled={pendingCount === 0 || saveMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              Guardar{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </Button>
          )}

          {canEdit && (
            <Button size="sm" className="h-8 gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nuevo socio
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-auto">
        <div style={{ width: totalWidth }} className="relative">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-grid-header">
            {table.getHeaderGroups().map((hg) => (
              <div key={hg.id} className="flex border-b" style={{ height: 32 }}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <div
                      key={header.id}
                      className="relative flex items-center border-r border-grid-line text-xs font-semibold text-foreground/80"
                      style={{ width: header.getSize() }}
                    >
                      <button
                        type="button"
                        disabled={!canSort}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "flex h-full w-full items-center gap-1 truncate px-2 text-left",
                          canSort && "hover:bg-accent/40",
                        )}
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {canSort &&
                          (sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3 shrink-0" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3 shrink-0" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-30" />
                          ))}
                      </button>
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none bg-transparent hover:bg-primary/40"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Filter row */}
            {showFilters && (
              <div className="flex border-b bg-card" style={{ height: 32 }}>
                {table.getHeaderGroups()[0].headers.map((header) => {
                  const field = SOCIO_FIELDS.find((f) => f.key === header.column.id);
                  return (
                    <div
                      key={header.id}
                      className="border-r border-grid-line"
                      style={{ width: header.getSize() }}
                    >
                      {field ? (
                        field.type === "boolean" ? (
                          <select
                            className="h-full w-full bg-transparent px-1 text-xs outline-none"
                            value={(header.column.getFilterValue() as string) ?? "all"}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                          >
                            <option value="all">Todos</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input
                            className="h-full w-full bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground/60"
                            placeholder="Filtrar…"
                            value={(header.column.getFilterValue() as string) ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                          />
                        )
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const row = tableRows[vi.index];
              const selected = row.getIsSelected();
              return (
                <div
                  key={row.id}
                  className={cn(
                    "absolute left-0 flex border-b border-grid-line",
                    selected
                      ? "bg-grid-row-selected"
                      : vi.index % 2 === 1
                        ? "bg-grid-row-alt"
                        : "bg-card",
                    "hover:bg-grid-row-hover",
                  )}
                  style={{
                    height: ROW_HEIGHT,
                    width: totalWidth,
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="flex items-center border-r border-grid-line"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-t bg-card px-3 text-[11px] text-muted-foreground">
        <span>
          {tableRows.length} de {rows.length} socios
          {selectedIds.length > 0 && ` · ${selectedIds.length} seleccionados`}
        </span>
        <span className={cn(pendingCount > 0 && "font-medium text-warning-foreground")}>
          {pendingCount > 0 ? `${pendingCount} cambio(s) sin guardar` : "Sin cambios"}
        </span>
      </div>

      <SocioDrawer
        socio={drawerSocio}
        open={drawerOpen}
        canEdit={canEdit}
        cooperativeId={cooperativeId}
        onOpenChange={setDrawerOpen}
        onSaved={() => setEdits({})}
      />

      <NuevoSocioDialog
        open={createOpen}
        cooperativeId={cooperativeId}
        userId={userId}
        onOpenChange={setCreateOpen}
        onCreated={openDrawer}
      />
    </div>
  );
}