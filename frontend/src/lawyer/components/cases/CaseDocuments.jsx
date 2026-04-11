import { useState } from "react";
import { FilePlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import UploadDocumentContent from "@/lawyer/components/cases/documents/UploadDocumentContent";
import EditDocumentDialog from "@/lawyer/components/cases/documents/EditDocumentDialog";
import { useCaseContext } from "@/lawyer/components/cases/CaseContext";
import { useAuth } from "@/context/auth/useAuth";
import DocumentCard from "./documents/DocumentCard";
import DocumentCardSkeleton from "./documents/DocumentCardSkeleton";

// Documents section for a single case: banner, list, and dialogs
export default function CaseDocuments() {
  // Derive the current user id from auth context
  const { userId: authUserId, user } = useAuth();
  const userId = authUserId || user?.id || user?._id;
  const [editingDoc, setEditingDoc] = useState(null);

  const {
    caseId,
    documents,
    documentsLoading,
    documentsError,
    isUploading,
    isUpdating,
    isDeleting,
    selectedFile,
    handleSelectFile,
    handleUploadDocumentConfirm,
    handleUpdateDocument,
    handleDeleteDocument,
    normalizedStatus,
  } = useCaseContext();

  // Case is closed -> disable uploads/edits
  const isAlreadyClosed = normalizedStatus === "closed";

  return (
    <AlertDialog>
      <div className="space-y-4">
        {/* Banner and primary upload CTA */}
        {!isAlreadyClosed && (
          <>
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
                  <Button disabled={isUploading || !caseId} className="gap-2">
                    <FilePlus className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Add document"}
                  </Button>
                </AlertDialogTrigger>
              </CardContent>
            </div>

            <Separator />
          </>
        )}

        {/* Documents list grid */}
        <div>
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {documentsError && (
              <p className="text-sm text-destructive mb-3">
                {documentsError.message || "Failed to load documents"}
              </p>
            )}

            {documentsLoading ? (
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
                    key={doc._id}
                    doc={doc}
                    userId={userId}
                    isAlreadyClosed={isAlreadyClosed}
                    onEditClick={setEditingDoc}
                    onDeleteConfirm={handleDeleteDocument}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      <UploadDocumentContent
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        onConfirm={handleUploadDocumentConfirm}
        isUploading={isUploading}
      />

      <EditDocumentDialog
        doc={editingDoc}
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        onConfirm={handleUpdateDocument}
        isUpdating={isUpdating}
      />
    </AlertDialog>
  );
}
