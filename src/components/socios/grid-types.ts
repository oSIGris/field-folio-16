import type { Socio } from "@/lib/socios/socios-fields";

export interface GridMeta {
  canEdit: boolean;
  getCellValue: (id: string, key: keyof Socio) => unknown;
  setCellValue: (id: string, key: keyof Socio, value: unknown) => void;
  isCellDirty: (id: string, key: keyof Socio) => boolean;
  openDrawer: (socio: Socio) => void;
}