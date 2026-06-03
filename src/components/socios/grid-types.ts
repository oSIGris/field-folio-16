import type { Socio } from "@/lib/socios/socios-fields";
import type { CustomField } from "@/lib/custom-fields/use-custom-fields";

export interface GridMeta {
  canEdit: boolean;
  getCellValue: (id: string, key: keyof Socio) => unknown;
  setCellValue: (id: string, key: keyof Socio, value: unknown) => void;
  isCellDirty: (id: string, key: keyof Socio) => boolean;
  openDrawer: (socio: Socio) => void;
  getCustomValue: (socioId: string, field: CustomField) => unknown;
  setCustomValue: (socioId: string, field: CustomField, value: unknown) => void;
  isCustomDirty: (socioId: string, fieldId: string) => boolean;
}