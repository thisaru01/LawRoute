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

export default function CivilIssueSubmitForm({ onCancel, onSuccess = () => {} }) {
  const attachmentsInputRef = useRef(null);

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
  } = useCivilIssueSubmitForm({ onSuccess });

  const errorBannerRef = useRef(null);

  useEffect(() => {
    if (!error) {
      return;
    }

    errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    errorBannerRef.current?.focus({ preventScroll: true });
  }, [error, submitAttemptCount]);

  if (success) {
    return <CivilIssueSubmitSuccess countdown={countdown} onRedirectNow={handleSuccess} />;
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

      <CivilIssueSubmitInfoBanner />

      <CivilIssueCategoryField
        value={formData.category}
        onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
        error={showValidationErrors ? fieldErrors.category : ""}
      />

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

      <CivilIssueAttachmentsSection
        attachments={attachments}
        maxFiles={MAX_FILES}
        maxFileSizeMB={MAX_FILE_SIZE_MB}
        inputRef={attachmentsInputRef}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        onTriggerFileDialog={() => attachmentsInputRef.current?.click()}
      />

      <CivilIssueVisibilityToggle
        checked={formData.isPublic}
        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked === true }))}
      />

      <CivilIssueSubmitActions
        busy={busy}
        disableSubmit={busy}
        onCancel={onCancel}
      />
    </form>
  );
}
