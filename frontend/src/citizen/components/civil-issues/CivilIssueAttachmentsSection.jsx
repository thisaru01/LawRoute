import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Paperclip } from "lucide-react";

export default function CivilIssueAttachmentsSection({
  attachments,
  maxFiles,
  maxFileSizeMB,
  inputRef,
  onFileChange,
  onRemoveFile,
  onTriggerFileDialog,
}) {
  const attachmentsInputId = useId();

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="space-y-1">
        <Label htmlFor={attachmentsInputId} className="text-xs font-semibold text-slate-900 sm:text-sm">Attachments (Optional)</Label>
        <p className="text-xs leading-snug text-slate-500">
          Max {maxFiles} files. Up to {maxFileSizeMB}MB each. Supported: JPG, PNG, PDF.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative flex-1 sm:flex-none">
          <input
            ref={inputRef}
            id={attachmentsInputId}
            type="file"
            multiple
            className="sr-only"
            onChange={onFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={attachments.length >= maxFiles}
          />
          <Button
            type="button"
            variant="outline"
            disabled={attachments.length >= maxFiles}
            onClick={onTriggerFileDialog}
            className="h-10 w-full items-center justify-center gap-2 border-2 border-dashed text-sm transition-all hover:bg-slate-50 sm:h-12 sm:w-auto sm:justify-start"
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Upload</span>
            <span className="hidden sm:inline">Upload Files</span>
          </Button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2 sm:p-3">
          {attachments.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <div className="shrink-0 rounded bg-blue-50 p-0.5 text-blue-600 sm:p-1">
                  <Paperclip className="h-3.5 w-3.5" />
                </div>
                <span className="min-w-0 truncate text-xs font-medium text-slate-700 sm:text-sm">{file.name}</span>
                <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-tighter text-slate-400 sm:text-xs">
                  {(file.size / (1024 * 1024)).toFixed(1)}MB
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(idx)}
                className="shrink-0 p-0.5 text-slate-400 transition-colors hover:text-destructive sm:p-1"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
