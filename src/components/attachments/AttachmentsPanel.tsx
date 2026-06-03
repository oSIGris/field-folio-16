import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Socio } from "@/lib/socios/socios-fields";

const BUCKET = "socio-attachments";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

type DocumentType = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
};

type Attachment = {
  id: string;
  cooperative_id: string;
  socio_id: string;
  document_type_id: string | null;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  uploaded_by: string | null;
  uploaded_at: string;
  deleted_at: string | null;
  document_type?: { name: string; code: string } | null;
};

function attachmentsKey(socioId: string) {
  return ["attachments", socioId] as const;
}

function documentTypesKey(cooperativeId: string) {
  return ["document-types", cooperativeId] as const;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._,() -]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140) || "documento";
}

function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return "El archivo supera el limite de 25 MB.";
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return "Tipo de archivo no permitido. Usa PDF, imagen, Word, Excel o CSV.";
  }
  return null;
}

export function AttachmentsPanel({
  socio,
  cooperativeId,
  canEdit,
}: {
  socio: Socio;
  cooperativeId: string;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState<string>("");

  const client = supabase as any;

  const documentTypesQuery = useQuery({
    queryKey: documentTypesKey(cooperativeId),
    queryFn: async (): Promise<DocumentType[]> => {
      const { data, error } = await client
        .from("document_types")
        .select("id, code, name, sort_order")
        .eq("active", true)
        .or(`cooperative_id.is.null,cooperative_id.eq.${cooperativeId}`)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const attachmentsQuery = useQuery({
    queryKey: attachmentsKey(socio.id),
    queryFn: async (): Promise<Attachment[]> => {
      const { data, error } = await client
        .from("attachments")
        .select("*, document_type:document_types(name, code)")
        .eq("cooperative_id", cooperativeId)
        .eq("socio_id", socio.id)
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const defaultDocumentTypeId = useMemo(() => {
    const types = documentTypesQuery.data ?? [];
    return documentTypeId || types.find((t) => t.code === "otro")?.id || types[0]?.id || "";
  }, [documentTypeId, documentTypesQuery.data]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) throw new Error(validationError);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("No hay usuario autenticado.");

      const attachmentId = crypto.randomUUID();
      const safeName = sanitizeFileName(file.name);
      const storagePath = `${cooperativeId}/${socio.id}/${attachmentId}/${safeName}`;
      const selectedDocumentTypeId = defaultDocumentTypeId || null;

      const { error: insertError } = await client.from("attachments").insert({
        id: attachmentId,
        cooperative_id: cooperativeId,
        socio_id: socio.id,
        document_type_id: selectedDocumentTypeId,
        storage_bucket: BUCKET,
        storage_path: storagePath,
        file_name: safeName,
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: userData.user.id,
      });
      if (insertError) throw insertError;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        await client
          .from("attachments")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", attachmentId)
          .eq("cooperative_id", cooperativeId);
        throw uploadError;
      }
    },
    onSuccess: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Archivo subido");
      queryClient.invalidateQueries({ queryKey: attachmentsKey(socio.id) });
    },
    onError: (error) => {
      toast.error("No se pudo subir el archivo", { description: (error as Error).message });
    },
  });

  const hideMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const { error } = await client
        .from("attachments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", attachmentId)
        .eq("cooperative_id", cooperativeId)
        .eq("socio_id", socio.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Archivo ocultado");
      queryClient.invalidateQueries({ queryKey: attachmentsKey(socio.id) });
    },
    onError: (error) => {
      toast.error("No se pudo ocultar", { description: (error as Error).message });
    },
  });

  const handleDownload = async (attachment: Attachment) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(attachment.storage_path);
    if (error) {
      toast.error("No se pudo descargar", { description: error.message });
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.file_name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadChange = (file: File | undefined) => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const attachments = attachmentsQuery.data ?? [];
  const documentTypes = documentTypesQuery.data ?? [];

  return (
    <section className="space-y-3 rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Documentacion</h3>
          <p className="text-xs text-muted-foreground">
            Adjuntos del expediente del socio
          </p>
        </div>
        <Badge variant="secondary">{attachments.length}</Badge>
      </div>

      {canEdit && (
        <div className="space-y-2 rounded-md border bg-card p-3">
          <div className="space-y-1">
            <Label htmlFor={`doc-type-${socio.id}`}>Tipo documental</Label>
            <select
              id={`doc-type-${socio.id}`}
              value={defaultDocumentTypeId}
              onChange={(event) => setDocumentTypeId(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="min-w-0 flex-1 text-xs"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv"
              disabled={uploadMutation.isPending || documentTypesQuery.isLoading}
              onChange={(event) => handleUploadChange(event.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Subir
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Maximo 25 MB. PDF, imagenes, Word, Excel o CSV.
          </p>
        </div>
      )}

      {attachmentsQuery.isLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando documentos...
        </div>
      ) : attachments.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          No hay archivos adjuntos.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{attachment.file_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {attachment.document_type?.name ?? "Sin clasificar"} - {formatBytes(Number(attachment.size_bytes))} - {new Date(attachment.uploaded_at).toLocaleDateString("es-ES")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="h-8 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Ver
              </Button>
              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => hideMutation.mutate(attachment.id)}
                  disabled={hideMutation.isPending}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  title="Ocultar archivo"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
