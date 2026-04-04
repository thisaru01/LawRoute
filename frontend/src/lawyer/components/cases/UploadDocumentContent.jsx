import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function UploadDocumentContent({
  selectedFile,
  onSelectFile,
  onConfirm,
  isUploading,
}) {
  return (
    <AlertDialogContent size="lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Add document</AlertDialogTitle>
        <AlertDialogDescription>
          Choose a file to upload for this case.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-3 text-sm text-foreground">
        <div className="space-y-1">
          <Label htmlFor="document-file">File</Label>
          <Input id="document-file" type="file" onChange={onSelectFile} />
        </div>
        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
