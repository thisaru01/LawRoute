import React from "react";
import Navbar from "@/components/Navbar.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/formatDateTime";
import { useAdminDocuments } from "@/hooks/documents/useAdminDocuments";

function PublicDocumentCard({ doc }) {
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

      {/* View link */}
      {doc.fileUrl && (
        <div className="mt-auto flex items-center justify-between gap-2 text-[11px]">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary underline underline-offset-2"
          >
            <ExternalLink className="h-3 w-3" />
            View file
          </a>
        </div>
      )}
    </div>
  );
}

function PublicDocumentCardSkeleton() {
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

export default function PublicDocumentsPage() {
  const { documents, loading, error } = useAdminDocuments();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-50 py-10 sm:py-14 border-b border-slate-200">
          <div className="mx-auto w-full max-w-6xl px-4 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Documents
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Browse publicly available legal documents uploaded by the
                platform administrators.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <PublicDocumentCardSkeleton />
                <PublicDocumentCardSkeleton />
                <PublicDocumentCardSkeleton />
                <PublicDocumentCardSkeleton />
                <PublicDocumentCardSkeleton />
                <PublicDocumentCardSkeleton />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <FileText className="mb-2 h-7 w-7 opacity-30" />
                No documents available yet.
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {documents.map((doc) => (
                  <PublicDocumentCard key={doc._id || doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}
