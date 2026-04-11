import React from "react";
import { FileText, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";
import { formatDateTime } from "@/lib/formatDateTime";

// Single case document card with preview, meta, and actions
function DocumentCard({
  doc,
  userId,
  isAlreadyClosed,
  onEditClick,
  onDeleteConfirm,
  isDeleting,
}) {
  // Resolve uploader id whether it's an object or string
  const uploaderId =
    typeof doc.uploadedBy === "object" ? doc.uploadedBy?._id : doc.uploadedBy;
  const isOwner = String(uploaderId) === String(userId);

  const fileName = doc.fileUrl?.split("/").pop() || doc.fileType || "Document";
  const extension =
    doc.fileType?.toUpperCase() ||
    fileName.split(".").pop()?.toUpperCase() ||
    "FILE";

  const isPdf =
    doc.fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  const isImage =
    doc.fileType?.startsWith("image/") ||
    [".png", ".jpg", ".jpeg", ".webp"].some((ext) =>
      fileName.toLowerCase().endsWith(ext),
    );

  // Prefer thumbnail for PDFs, full file for images
  const previewUrl = isPdf ? doc.thumbnailUrl : isImage ? doc.fileUrl : null;

  return (
    <div className="group flex flex-col gap-1 rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-muted/40">
      {/* Preview thumbnail for PDFs and images */}
      {previewUrl && (
        <div className="mb-2 overflow-hidden rounded-md border bg-muted/50 aspect-4/3">
          <img
            src={previewUrl}
            alt={fileName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      {/* Icon + extension badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {extension}
        </span>
      </div>

      {/* Title & file name */}
      <div className="mt-1">
        <p
          className="text-sm font-medium text-foreground leading-snug wrap-break-word line-clamp-2"
          title={doc.title || fileName}
        >
          {doc.title || fileName}
        </p>
        <p
          className="text-[10px] text-muted-foreground truncate mt-0.5"
          title={fileName}
        >
          {fileName}
        </p>
      </div>

      {/* Optional description */}
      {doc.description && (
        <p
          className="text-xs text-muted-foreground mt-1.5 wrap-break-word line-clamp-2"
          title={doc.description}
        >
          {doc.description}
        </p>
      )}

      {/* Uploaded date */}
      {doc.createdAt && (
        <p className="text-[11px] text-muted-foreground">
          {formatDateTime(doc.createdAt)}
        </p>
      )}

      {/* Actions: view / edit / delete */}
      <div className="mt-auto flex items-center justify-between gap-1">
        {doc.fileUrl && (
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary underline underline-offset-2"
          >
            <ExternalLink className="h-3 w-3" />
            View file
          </a>
        )}

        <div className="flex gap-1 ml-auto">
          {isOwner && !isAlreadyClosed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => onEditClick(doc)}
            >
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Edit Document</span>
            </Button>
          )}

          {isOwner && !isAlreadyClosed && (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete Document</span>
                </Button>
              }
              title="Delete Document?"
              description={`Are you sure you want to delete "${doc.title || fileName}"? This action cannot be undone.`}
              confirmLabel="Delete"
              confirmClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onConfirm={() => onDeleteConfirm(doc._id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
