import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FilePlus, FileText, ExternalLink, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/formatDateTime";
import { useAdminDocuments } from "@/hooks/documents/useAdminDocuments";
import AdminUploadDocumentContent from "@/admin/components/documents/AdminUploadDocumentContent";
import EditDocumentDialog from "@/lawyer/components/cases/documents/EditDocumentDialog";

function DocumentCard({ doc, onDelete, onEdit }) {
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

  const previewUrl = isPdf ? doc.thumbnailUrl : isImage ? doc.fileUrl : null;

  const id = doc._id || doc.id;

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

      {/* Icon + extension */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {extension}
        </span>
      </div>

      {/* Title & File name */}
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

      {/* Description */}
      {doc.description && (
        <p
          className="text-xs text-muted-foreground mt-1.5 wrap-break-word line-clamp-2"
          title={doc.description}
        >
          {doc.description}
        </p>
      )}

      {/* Date */}
      {doc.createdAt && (
        <p className="text-[11px] text-muted-foreground">
          {formatDateTime(doc.createdAt)}
        </p>
      )}

      {/* View link + actions (edit / delete) */}
      {doc.fileUrl && (
        <div className="mt-auto flex items-center gap-1">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary underline underline-offset-2"
          >
            <ExternalLink className="h-3 w-3" />
            View file
          </a>

          <div className="flex gap-1 ml-auto">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                aria-label="Edit document"
                onClick={() => onEdit(doc)}
              >
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Edit document</span>
              </Button>
            )}

            {isPdf && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete document</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The document will be permanently
                      removed from the library.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async (event) => {
                        event.preventDefault();
                        const ok = await onDelete(id);
                        if (ok) {
                          toast.success("Document deleted successfully");
                        } else {
                          toast.error("Failed to delete document");
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCardSkeleton() {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  );
}

export default function AdminDocuments() {
  const {
    documents,
    loading,
    error,
    isUploading,
    isUpdating,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleDelete,
    handleUpdateDocument,
  } = useAdminDocuments();

  const [editingDoc, setEditingDoc] = React.useState(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const openEdit = (doc) => {
    setEditingDoc(doc);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingDoc(null);
  };

  const onConfirmEdit = async (docId, title, description) => {
    const ok = await handleUpdateDocument(docId, title, description);
    return ok;
  };

  return (
    <AlertDialog>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Add Documents Banner */}
            <div>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FilePlus className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Add Documents</p>
                  <p className="text-sm text-muted-foreground">
                    Upload files relevant to this case for easy access.
                  </p>
                </div>
                <AlertDialogTrigger asChild>
                  <Button disabled={isUploading} className="gap-2">
                    <FilePlus className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Add document"}
                  </Button>
                </AlertDialogTrigger>
              </CardContent>
            </div>

            <Separator />

            {/* Documents list */}
            <div>
              <CardHeader className="pb-3 px-0">
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {error && (
                  <p className="text-sm text-destructive mb-3">{error}</p>
                )}

                {loading ? (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <DocumentCardSkeleton />
                    <DocumentCardSkeleton />
                    <DocumentCardSkeleton />
                    <DocumentCardSkeleton />
                    <DocumentCardSkeleton />
                    <DocumentCardSkeleton />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                    <FileText className="mb-2 h-7 w-7 opacity-30" />
                    No documents attached yet.
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc._id || doc.id}
                        doc={doc}
                        onDelete={handleDelete}
                        onEdit={openEdit}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminUploadDocumentContent
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        onConfirm={handleUploadDocumentConfirm}
        isUploading={isUploading}
      />
      <EditDocumentDialog
        doc={editingDoc}
        isOpen={isEditOpen}
        onClose={closeEdit}
        onConfirm={onConfirmEdit}
        isUpdating={isUpdating}
      />
    </AlertDialog>
  );
}
