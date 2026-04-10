import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import CivilIssueSubmitSuccess from "@/citizen/components/civil-issues/CivilIssueSubmitSuccess.jsx";
import { useCivilIssueSubmitForm } from "@/citizen/components/civil-issues/hooks/useCivilIssueSubmitForm.js";
import CivilIssueSubmitInfoBanner from "@/citizen/components/civil-issues/CivilIssueSubmitInfoBanner.jsx";
import CivilIssueCategoryField from "@/citizen/components/civil-issues/CivilIssueCategoryField.jsx";
import CivilIssueDistrictField from "@/citizen/components/civil-issues/CivilIssueDistrictField.jsx";
import CivilIssueSubjectField from "@/citizen/components/civil-issues/CivilIssueSubjectField.jsx";
import CivilIssueReportDetailsSection from "@/citizen/components/civil-issues/CivilIssueReportDetailsSection.jsx";
import CivilIssueAttachmentsSection from "@/citizen/components/civil-issues/CivilIssueAttachmentsSection.jsx";
import CivilIssueVisibilityToggle from "@/citizen/components/civil-issues/CivilIssueVisibilityToggle.jsx";
import CivilIssueSubmitActions from "@/citizen/components/civil-issues/CivilIssueSubmitActions.jsx";
import CivilIssueAwarenessDialog from "@/public/civil-issues/components/CivilIssueAwarenessDialog.jsx";

export default function CivilIssueSubmitForm({
  mode = "create",
  issueId,
  initialData = null,
  onCancel,
  onSuccess = () => {},
}) {
  const attachmentsInputRef = useRef(null);
  const isEditMode = mode === "edit";

  const {
    MAX_FILE_SIZE_MB,
    MAX_FILES,
    MAX_SUBJECT_LENGTH,
    attachments,
    busy,
    countdown,
    error,
    fieldErrors,
    formData,
    handleFileChange,
    handleSubmit,
    removeFile,
    setFormData,
    showValidationErrors,
    submitAttemptCount,
    success,
    onSuccess: handleSuccess,
  } = useCivilIssueSubmitForm({ mode, issueId, initialData, onSuccess });

  const errorBannerRef = useRef(null);

  useEffect(() => {
    if (!error) {
      return;
    }

    errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    errorBannerRef.current?.focus({ preventScroll: true });
  }, [error, submitAttemptCount]);

  if (success) {
    return (
      <CivilIssueSubmitSuccess
        countdown={countdown}
        onRedirectNow={handleSuccess}
        title={isEditMode ? "Issue Updated Successfully" : "Issue Submitted Successfully"}
        description={isEditMode
          ? "Your report details have been updated while the issue is still pending review."
          : "Your report has been received and assigned to the relevant authority."}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
      {error && (
        <div
          ref={errorBannerRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 sm:gap-3 sm:p-4 sm:text-sm outline-none"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 flex-none sm:h-5 sm:w-5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {!isEditMode ? <CivilIssueSubmitInfoBanner /> : null}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600 sm:text-sm">
            Need category-specific reporting guidance before submitting?
          </p>
          <CivilIssueAwarenessDialog
            selectedCategory={formData.category}
            triggerLabel="Open Awareness Q&A"
            triggerVariant="outline"
            triggerClassName="h-8 text-xs sm:h-9 sm:text-sm"
          />
        </div>
      </div>

      {!isEditMode ? (
        <CivilIssueCategoryField
          value={formData.category}
          onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
          error={showValidationErrors ? fieldErrors.category : ""}
        />
      ) : null}

      <CivilIssueDistrictField
        value={formData.district}
        onChange={(val) => setFormData((prev) => ({ ...prev, district: val }))}
        error={showValidationErrors ? fieldErrors.district : ""}
      />

      <CivilIssueSubjectField
        value={formData.subject}
        maxLength={MAX_SUBJECT_LENGTH}
        onChange={(value) => setFormData((prev) => ({ ...prev, subject: value }))}
        error={showValidationErrors ? fieldErrors.subject : ""}
      />

      <CivilIssueReportDetailsSection
        value={formData}
        onChange={setFormData}
        errors={showValidationErrors ? fieldErrors : {}}
      />

      {!isEditMode ? (
        <CivilIssueAttachmentsSection
          attachments={attachments}
          maxFiles={MAX_FILES}
          maxFileSizeMB={MAX_FILE_SIZE_MB}
          inputRef={attachmentsInputRef}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          onTriggerFileDialog={() => attachmentsInputRef.current?.click()}
        />
      ) : null}

      <CivilIssueVisibilityToggle
        checked={formData.isPublic}
        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked === true }))}
      />

      <CivilIssueSubmitActions
        busy={busy}
        disableSubmit={busy}
        onCancel={onCancel}
        submitLabel={isEditMode ? "Save Changes" : "Complete Submission"}
        busyLabel={isEditMode ? "Saving..." : "Submitting..."}
      />
    </form>
  );
}
