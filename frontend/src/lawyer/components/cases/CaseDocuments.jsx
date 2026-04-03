import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import UploadDocumentContent from "@/lawyer/components/cases/UploadDocumentContent";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function CaseDocuments({
  caseId,
  documents,
  documentsLoading,
  documentsError,
  isUploading,
  selectedFile,
  onSelectFile,
  onUploadConfirm,
}) {
  return (
    <AlertDialog>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Documents
            </h3>
            <p className="text-sm text-muted-foreground">
              Documents attached to this case.
            </p>
          </div>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isUploading || !caseId}>
              {isUploading ? "Uploading..." : "Add document"}
            </Button>
          </AlertDialogTrigger>
        </div>

        {/* Error */}
        {documentsError && (
          <p className="text-sm text-destructive">
            {documentsError.message || "Failed to load documents"}
          </p>
        )}

        {/* Content */}
        {documentsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2 h-8 w-8 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            No documents attached yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="rounded-md border bg-background px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">
                    {doc.fileType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(doc.createdAt)}
                  </span>
                </div>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-xs text-primary underline underline-offset-2"
                  >
                    {doc.fileUrl}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <UploadDocumentContent
        selectedFile={selectedFile}
        onSelectFile={onSelectFile}
        onConfirm={onUploadConfirm}
        isUploading={isUploading}
      />
    </AlertDialog>
  );
}
