import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Dialog used to rename a document and update its description
export default function EditDocumentDialog({
  doc,
  isOpen,
  onClose,
  onConfirm,
  isUpdating,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // When a document is selected and dialog opens, preload its values
  useEffect(() => {
    if (doc && isOpen) {
      const t = doc.title || "";
      const d = doc.description || "";
      Promise.resolve().then(() => {
        setTitle(t);
        setDescription(d);
      });
      return;
    }
    Promise.resolve().then(() => {
      setTitle("");
      setDescription("");
    });
  }, [doc, isOpen]);

  // Confirm handler delegates update logic back to parent via onConfirm
  const handleSave = async () => {
    if (!title.trim() || !doc) return;
    const success = await onConfirm(doc._id, title, description);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Document Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Court Order"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-description">Description (Optional)</Label>
            <Textarea
              id="doc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !title.trim()}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
