import { memo } from "react";
import type { CellContext } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  parseOptions,
  type CustomField,
} from "@/lib/custom-fields/use-custom-fields";
import type { Socio } from "@/lib/socios/socios-fields";
import type { GridMeta } from "./grid-types";

function CustomFieldCellInner({
  cell,
  field,
}: {
  cell: CellContext<Socio, unknown>;
  field: CustomField;
}) {
  const meta = cell.table.options.meta as GridMeta;
  const socioId = cell.row.original.id;
  const value = meta.getCustomValue(socioId, field);
  const dirty = meta.isCustomDirty(socioId, field.id);
  const disabled = !meta.canEdit;

  const base = cn(
    "h-full w-full bg-transparent px-2 text-[13px] outline-none focus:bg-accent/40",
    dirty && "bg-cell-pending text-cell-pending-foreground",
  );

  if (field.field_type === "boolean") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          dirty && "bg-cell-pending",
        )}
      >
        <Checkbox
          checked={!!value}
          disabled={disabled}
          onCheckedChange={(c) => meta.setCustomValue(socioId, field, !!c)}
        />
      </div>
    );
  }

  if (field.field_type === "select") {
    const options = parseOptions(field.options);
    return (
      <select
        className={cn(base, "cursor-pointer appearance-none")}
        value={(value as string) ?? ""}
        disabled={disabled}
        onChange={(e) => meta.setCustomValue(socioId, field, e.target.value || null)}
      >
        <option value="">-</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.field_type === "multiselect") {
    const options = parseOptions(field.options);
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (v: string) => {
      const next = selected.includes(v)
        ? selected.filter((x) => x !== v)
        : [...selected, v];
      meta.setCustomValue(socioId, field, next);
    };
    return (
      <div
        className={cn(
          "flex h-full w-full items-center gap-1 overflow-x-auto px-1",
          dirty && "bg-cell-pending",
        )}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(o.value)}
            className={cn(
              "shrink-0 rounded px-1.5 text-[11px]",
              selected.includes(o.value)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  const isNumber =
    field.field_type === "number" ||
    field.field_type === "currency" ||
    field.field_type === "percentage";

  return (
    <input
      type={
        field.field_type === "date" ? "date" : isNumber ? "number" : "text"
      }
      className={base}
      value={value === null || value === undefined ? "" : (value as string | number)}
      disabled={disabled}
      onChange={(e) =>
        meta.setCustomValue(
          socioId,
          field,
          isNumber ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value || null,
        )
      }
    />
  );
}

export const CustomFieldCell = memo(CustomFieldCellInner);