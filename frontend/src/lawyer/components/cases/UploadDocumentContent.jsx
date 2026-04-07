import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setTitle("");
      setDescription("");
    } else if (!title) {
      setTitle(selectedFile.name.split(".").slice(0, -1).join(".") || selectedFile.name);
    }
  }, [selectedFile]);

  const handleConfirm = () => {
    onConfirm({ title, description });
  };

  return (
    <AlertDialogContent size="lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Add document</AlertDialogTitle>
        <AlertDialogDescription>
          Choose a file and provide details to upload for this case.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4 text-sm text-foreground">
        <div className="space-y-1.5">
          <Label htmlFor="document-file">File</Label>
          <Input id="document-file" type="file" onChange={onSelectFile} />
          {selectedFile && (
            <p className="text-xs text-muted-foreground mt-1">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="document-title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="document-title"
            placeholder="E.g., Defendant statement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="document-description">Description (Optional)</Label>
          <Textarea
            id="document-description"
            placeholder="Brief description of the document..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={isUploading || !selectedFile || !title.trim()}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
