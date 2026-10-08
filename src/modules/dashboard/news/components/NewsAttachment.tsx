import { File, FileImage, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export type AttachmentKind = "pdf" | "word" | "excel" | "image" | "file";

/** Detect file kind from the stored filename (extension-based). */
export function getAttachmentKind(filename?: string | null): AttachmentKind {
  const clean = (filename || "").split("?")[0].split("#")[0];
  const ext = (clean.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "rtf", "txt"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"].includes(ext)) return "image";
  return "file";
}

export function getAttachmentLabel(kind: AttachmentKind): string {
  if (kind === "pdf") return "PDF";
  if (kind === "word") return "WORD";
  if (kind === "excel") return "EXCEL";
  if (kind === "image") return "IMG";
  return "FILE";
}

const KIND_ICON = {
  pdf: FileText,
  word: FileType,
  excel: FileSpreadsheet,
  image: FileImage,
  file: File,
} as const;

const KIND_COLOR = {
  pdf: "text-red-600 dark:text-red-400",
  word: "text-blue-600 dark:text-blue-400",
  excel: "text-emerald-600 dark:text-emerald-400",
  image: "text-violet-600 dark:text-violet-400",
  file: "text-muted-foreground",
} as const;

/** File-type icon (PDF red / Word blue / Excel green / Image violet / generic muted). */
export function AttachmentIcon({
  filename,
  className,
}: {
  filename?: string | null;
  className?: string;
}) {
  const kind = getAttachmentKind(filename);
  const Icon = KIND_ICON[kind];
  return <Icon className={cn("size-4 shrink-0", KIND_COLOR[kind], className)} />;
}

/** Icon + EXT pill. Full filename is kept in the title tooltip. */
export function AttachmentChip({ filename }: { filename: string }) {
  const kind = getAttachmentKind(filename);
  return (
    <span
      title={filename}
      className="inline-flex max-w-[150px] items-center gap-1.5"
    >
      <AttachmentIcon filename={filename} />
      <span className="shrink-0 rounded bg-primary/10 px-1 text-[9px] font-bold uppercase text-primary">
        {getAttachmentLabel(kind)}
      </span>
    </span>
  );
}
