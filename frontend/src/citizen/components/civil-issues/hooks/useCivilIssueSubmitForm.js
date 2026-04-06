import { useState } from "react";
import { submitCivilIssue } from "@/api/services/civilIssueService";
import { useCivilIssueAttachments } from "@/citizen/components/civil-issues/hooks/useCivilIssueAttachments.js";
import { useCountdownRedirect } from "@/citizen/components/civil-issues/hooks/useCountdownRedirect.js";

const MAX_SUBJECT_LENGTH = 120;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const POSTCODE_PATTERN = /^\d{5}$/;
const CONTACT_NUMBER_PATTERN = /^\d{10}$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;

const isValidDateOnly = (value) => {
  if (!isFilled(value) || !DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === value;
};

const getFieldErrors = (data) => ({
  category: !isFilled(data.category) ? "Please select a category." : "",
  subject: !isFilled(data.subject) ? "Please enter a subject." : "",
  district: !isFilled(data.district) ? "Please select a district." : "",
  exactLocation: !isFilled(data.exactLocation)
    ? "Please enter the town or village."
    : !data.exactLocationSelected
      ? "Please select a location from suggestions."
      : "",
  postalAreaOrZip: !isFilled(data.postalAreaOrZip)
    ? "Please enter the postal area or zip code."
    : !POSTCODE_PATTERN.test(data.postalAreaOrZip)
      ? "Postal area or ZIP must be exactly 5 digits."
      : "",
  whatHappened: !isFilled(data.whatHappened) ? "Please describe what happened." : "",
  whenItHappened: !isFilled(data.whenItHappened)
    ? "Please select when it happened."
    : !isValidDateOnly(data.whenItHappened)
      ? "Please select a valid incident date."
      : "",
  impactOnPeople: !isFilled(data.impactOnPeople) ? "Please explain how it affects people." : "",
  contactNumber: !isFilled(data.contactNumber)
    ? "Please provide a contact number."
    : !CONTACT_NUMBER_PATTERN.test(data.contactNumber)
      ? "Contact number must be exactly 10 digits."
      : "",
});

const hasAnyFieldError = (errors) => Object.values(errors).some(Boolean);

export function useCivilIssueSubmitForm({ onSuccess = () => {} } = {}) {
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    district: "",
    exactLocation: "",
    exactLocationSelected: false,
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
  const [submitAttemptCount, setSubmitAttemptCount] = useState(0);

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
    formData.exactLocationSelected &&
    POSTCODE_PATTERN.test(formData.postalAreaOrZip) &&
    isFilled(formData.whatHappened) &&
    isValidDateOnly(formData.whenItHappened) &&
    isFilled(formData.impactOnPeople) &&
    CONTACT_NUMBER_PATTERN.test(formData.contactNumber);

  const fieldErrors = getFieldErrors(formData);
  const showValidationErrors = submitAttempted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitAttemptCount((count) => count + 1);

    if (hasAnyFieldError(fieldErrors)) {
      setError("Please review the highlighted fields and correct the invalid values.");
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
    submitAttemptCount,
    success,
    onSuccess,
  };
}
