import { memo } from "react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { TIPO_OPTIONS, type FieldDef, type Socio } from "@/lib/socios/socios-fields";

function EditableCellInner({
  id,
  field,
  value,
  dirty,
  canEdit,
  setCellValue,
}: {
  id: string;
  field: FieldDef;
  value: unknown;
  dirty: boolean;
  canEdit: boolean;
  setCellValue: (id: string, key: keyof Socio, value: unknown) => void;
}) {
  const disabled = !canEdit;

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
          onCheckedChange={(c) => setCellValue(id, field.key, !!c)}
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
        onChange={(e) => setCellValue(id, field.key, e.target.value)}
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
      onChange={(e) => setCellValue(id, field.key, e.target.value || null)}
    />
  );
}

export const EditableCell = memo(EditableCellInner);