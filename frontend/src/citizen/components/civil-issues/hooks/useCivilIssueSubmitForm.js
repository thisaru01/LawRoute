import { useState } from "react";
import { submitCivilIssue } from "@/api/services/civilIssueService";
import { useCivilIssueAttachments } from "@/citizen/components/civil-issues/hooks/useCivilIssueAttachments.js";
import { useCountdownRedirect } from "@/citizen/components/civil-issues/hooks/useCountdownRedirect.js";

const MAX_SUBJECT_LENGTH = 120;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;

const getFieldErrors = (data) => ({
  category: !isFilled(data.category) ? "Please select a category." : "",
  subject: !isFilled(data.subject) ? "Please enter a subject." : "",
  district: !isFilled(data.district) ? "Please select a district." : "",
  exactLocation: !isFilled(data.exactLocation) ? "Please enter the town or village." : "",
  postalAreaOrZip: !isFilled(data.postalAreaOrZip) ? "Please enter the postal area or zip code." : "",
  whatHappened: !isFilled(data.whatHappened) ? "Please describe what happened." : "",
  whenItHappened: !isFilled(data.whenItHappened) ? "Please select when it happened." : "",
  impactOnPeople: !isFilled(data.impactOnPeople) ? "Please explain how it affects people." : "",
  contactNumber: !isFilled(data.contactNumber) ? "Please provide a contact number." : "",
});

const hasAnyFieldError = (errors) => Object.values(errors).some(Boolean);

const reportFirstInvalidTypingField = (formElement) => {
  if (!formElement) {
    return;
  }

  const typingFields = formElement.querySelectorAll("input[required], textarea[required]");

  for (const field of typingFields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      break;
    }
  }
};

export function useCivilIssueSubmitForm({ onSuccess = () => {} } = {}) {
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    district: "",
    exactLocation: "",
    postalAreaOrZip: "",
    whatHappened: "",
    whenItHappened: "",
    impactOnPeople: "",
    contactNumber: "",
    isPublic: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { attachments, handleFileChange, removeFile } = useCivilIssueAttachments({
    maxFiles: MAX_FILES,
    maxFileSizeMB: MAX_FILE_SIZE_MB,
    onError: setError,
  });

  const { countdown, setCountdown } = useCountdownRedirect({
    enabled: success,
    initialSeconds: 20,
    onComplete: onSuccess,
  });

  const canSubmit =
    isFilled(formData.category) &&
    isFilled(formData.subject) &&
    isFilled(formData.district) &&
    isFilled(formData.exactLocation) &&
    isFilled(formData.postalAreaOrZip) &&
    isFilled(formData.whatHappened) &&
    isFilled(formData.whenItHappened) &&
    isFilled(formData.impactOnPeople) &&
    isFilled(formData.contactNumber);

  const fieldErrors = getFieldErrors(formData);
  const showValidationErrors = submitAttempted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (hasAnyFieldError(fieldErrors)) {
      setError("Please fill in all required fields.");
      reportFirstInvalidTypingField(e.currentTarget);
      return;
    }

    setError("");
    setBusy(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("subject", formData.subject);
      data.append("district", formData.district);
      data.append("exactLocation", formData.exactLocation);
      data.append("postalAreaOrZip", formData.postalAreaOrZip);
      data.append("whatHappened", formData.whatHappened);
      data.append("whenItHappened", formData.whenItHappened);
      data.append("impactOnPeople", formData.impactOnPeople);
      data.append("contactNumber", formData.contactNumber);
      data.append("isPublic", String(formData.isPublic === true));

      attachments.forEach((file) => {
        data.append("attachments", file);
      });

      await submitCivilIssue(data);
      setCountdown(20);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Something went wrong while submitting.");
    } finally {
      setBusy(false);
    }
  };

  return {
    MAX_FILE_SIZE_MB,
    MAX_FILES,
    MAX_SUBJECT_LENGTH,
    attachments,
    busy,
    countdown,
    canSubmit,
    error,
    fieldErrors,
    formData,
    handleFileChange,
    handleSubmit,
    removeFile,
    setFormData,
    showValidationErrors,
    success,
    onSuccess,
  };
}
