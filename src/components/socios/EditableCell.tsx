import { memo } from "react";
import type { CellContext } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { TIPO_OPTIONS, type FieldDef, type Socio } from "@/lib/socios/socios-fields";
import type { GridMeta } from "./grid-types";

function EditableCellInner({
  cell,
  field,
}: {
  cell: CellContext<Socio, unknown>;
  field: FieldDef;
}) {
  const meta = cell.table.options.meta as GridMeta;
  const id = cell.row.original.id;
  const value = cell.getValue();
  const dirty = meta.isCellDirty(id, field.key);
  const disabled = !meta.canEdit;

  const base = cn(
    "h-full w-full bg-transparent px-2 text-[13px] outline-none focus:bg-accent/40",
    dirty && "bg-cell-pending text-cell-pending-foreground",
  );

  if (field.type === "boolean") {
    return (
      <div
        className={cn("flex h-full w-full items-center justify-center", dirty && "bg-cell-pending")}
      >
        <Checkbox
          checked={!!value}
          disabled={disabled}
          onCheckedChange={(c) => meta.setCellValue(id, field.key, !!c)}
        />
      </div>
    );
  }

  if (field.type === "enum") {
    return (
      <select
        className={cn(base, "cursor-pointer appearance-none")}
        value={(value as string) ?? ""}
        disabled={disabled}
        onChange={(e) => meta.setCellValue(id, field.key, e.target.value)}
      >
        {(field.options ?? TIPO_OPTIONS).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === "date" ? "date" : "text"}
      className={base}
      value={(value as string) ?? ""}
      disabled={disabled}
      onChange={(e) => meta.setCellValue(id, field.key, e.target.value || null)}
    />
  );
}

export const EditableCell = memo(EditableCellInner);