import { useEffect, useState } from "react";
import { toast } from "sonner";
import { submitCivilIssue, updateCivilIssue } from "@/api/services/civilIssueService";
import { useCivilIssueAttachments } from "@/citizen/components/civil-issues/hooks/useCivilIssueAttachments.js";
import { useCountdownRedirect } from "@/citizen/components/civil-issues/hooks/useCountdownRedirect.js";

const MAX_SUBJECT_LENGTH = 120;
const MIN_SUBJECT_LENGTH = 5;
const MAX_EXACT_LOCATION_LENGTH = 120;
const MIN_EXACT_LOCATION_LENGTH = 2;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const POSTCODE_PATTERN = /^\d{5}$/;
const CONTACT_NUMBER_PATTERN = /^\d{10}$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SUBJECT_ALLOWED_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.,:;()'"/&%+!?-]*$/u;
const SUBJECT_HAS_LETTER_PATTERN = /\p{L}/u;
const EXACT_LOCATION_ALLOWED_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.'\-/,()]*$/u;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;
const normalizeText = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");
const isLowSignalSubject = (value) => {
  const compact = normalizeText(value).replace(/[\s.,:;()'"/&%+!?-]/g, "");
  return compact.length >= 5 && /^([\p{L}\p{N}])\1+$/u.test(compact);
};

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
  subject: !isFilled(data.subject)
    ? "Please enter a subject."
    : normalizeText(data.subject).length < MIN_SUBJECT_LENGTH
      ? `Subject must be at least ${MIN_SUBJECT_LENGTH} characters.`
      : normalizeText(data.subject).length > MAX_SUBJECT_LENGTH
        ? `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`
        : !SUBJECT_ALLOWED_PATTERN.test(normalizeText(data.subject))
          ? "Subject contains invalid characters. Use letters, numbers, spaces, and common punctuation only."
          : !SUBJECT_HAS_LETTER_PATTERN.test(normalizeText(data.subject))
            ? "Subject must include at least one letter."
            : isLowSignalSubject(data.subject)
              ? "Subject looks too repetitive. Please enter a meaningful title."
          : "",
  district: !isFilled(data.district) ? "Please select a district." : "",
  exactLocation: !isFilled(data.exactLocation)
    ? "Please enter the town or village."
    : normalizeText(data.exactLocation).length < MIN_EXACT_LOCATION_LENGTH
      ? `Town or village must be at least ${MIN_EXACT_LOCATION_LENGTH} characters.`
      : normalizeText(data.exactLocation).length > MAX_EXACT_LOCATION_LENGTH
        ? `Town or village must be ${MAX_EXACT_LOCATION_LENGTH} characters or fewer.`
        : !EXACT_LOCATION_ALLOWED_PATTERN.test(normalizeText(data.exactLocation))
          ? "Town or village contains invalid characters."
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

const createInitialFormState = () => ({
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

const mapIssueToFormData = (issue) => ({
  category: issue?.category || "",
  subject: issue?.subject || "",
  district: issue?.district || "",
  exactLocation: issue?.exactLocation || "",
  exactLocationSelected: Boolean(issue?.exactLocation),
  postalAreaOrZip: issue?.postalAreaOrZip || "",
  whatHappened: issue?.whatHappened || "",
  whenItHappened: typeof issue?.whenItHappened === "string" ? issue.whenItHappened.slice(0, 10) : "",
  impactOnPeople: issue?.impactOnPeople || "",
  contactNumber: issue?.contactNumber || "",
  isPublic: issue?.isPublic === true,
});

export function useCivilIssueSubmitForm({
  mode = "create",
  issueId,
  initialData = null,
  onSuccess = () => {},
} = {}) {
  const [formData, setFormData] = useState({
    ...createInitialFormState(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitAttemptCount, setSubmitAttemptCount] = useState(0);

  const [retainedAttachments, setRetainedAttachments] = useState([]);
  const [remainingFilesAllowed, setRemainingFilesAllowed] = useState(MAX_FILES);

  const { attachments, handleFileChange, removeFile } = useCivilIssueAttachments({
    maxFiles: remainingFilesAllowed,
    maxFileSizeMB: MAX_FILE_SIZE_MB,
    onError: setError,
  });

  const { countdown, setCountdown } = useCountdownRedirect({
    enabled: success,
    initialSeconds: 20,
    onComplete: onSuccess,
  });

  const fieldErrors = getFieldErrors(formData);
  const canSubmit = !hasAnyFieldError(fieldErrors);
  const showValidationErrors = submitAttempted;
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setFormData(mapIssueToFormData(initialData));
    if (initialData.attachments) {
      setRetainedAttachments(initialData.attachments);
      setRemainingFilesAllowed(Math.max(0, MAX_FILES - initialData.attachments.length));
    }
  }, [initialData]);

  const removeExistingFile = (urlToRemove) => {
    setRetainedAttachments((prev) => {
      const updated = prev.filter((url) => url !== urlToRemove);
      setRemainingFilesAllowed(Math.max(0, MAX_FILES - updated.length));
      return updated;
    });
  };

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
      if (isEditMode) {
        const data = new FormData();
        data.append("subject", normalizeText(formData.subject));
        data.append("district", formData.district);
        data.append("exactLocation", normalizeText(formData.exactLocation));
        data.append("postalAreaOrZip", formData.postalAreaOrZip);
        data.append("whatHappened", formData.whatHappened);
        data.append("whenItHappened", formData.whenItHappened);
        data.append("impactOnPeople", formData.impactOnPeople);
        data.append("contactNumber", formData.contactNumber);
        data.append("isPublic", String(formData.isPublic === true));

        retainedAttachments.forEach((url) => {
          data.append("retainedAttachments", url);
        });

        attachments.forEach((file) => {
          data.append("attachments", file);
        });

        await updateCivilIssue(issueId, data);
      } else {
        const data = new FormData();
        data.append("category", formData.category);
        data.append("subject", normalizeText(formData.subject));
        data.append("district", formData.district);
        data.append("exactLocation", normalizeText(formData.exactLocation));
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
      }

      if (isEditMode) {
        toast.success("Civil issue updated successfully.");
        onSuccess();
      } else {
        toast.success("Civil issue submitted successfully.");
        setCountdown(20);
        setSuccess(true);
      }
    } catch (err) {
      const errorMessage = err?.message || "Something went wrong while submitting.";
      toast.error(errorMessage);
      setError(errorMessage);
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
    removeExistingFile,
    retainedAttachments,
    setFormData,
    showValidationErrors,
    submitAttemptCount,
    success,
    onSuccess,
  };
}
