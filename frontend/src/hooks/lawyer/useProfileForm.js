import { useState, useCallback, useMemo } from "react";

const DEFAULT_FORM = {
  name: "",
  professionalTitle: "",
  bio: "",
  totalYearsExperience: "",
  isFree: false,
  expertise: "general",
  phone: "",
  officeAddress: "",
  location: "",
  languages: [],
  practiceAreas: [],
  barRegistrationNumber: "",
  memberships: "",
  education: [],
  certifications: [],
  workHistory: [],
};

const listToCsv = (list) => {
  if (!Array.isArray(list)) return "";

  return list
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && typeof item.name === "string") {
        return item.name.trim();
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
};

const csvToList = (value) => {
  if (!value || typeof value !== "string") return [];

  const unique = new Set();
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((entry) => unique.add(entry));

  return Array.from(unique);
};

export const validateBarNumber = (value) => {
  if (!value || typeof value !== "string") return "Bar registration number is required.";
  
  const trimmed = value.trim();
  const brnRegex = /^BRN-(\d{4})-(\d{4,6})$/i;
  const match = trimmed.match(brnRegex);

  if (!match) {
    return "Invalid format. Expected: BRN-YYYY-NNNN (e.g., BRN-2024-0001)";
  }

  const year = parseInt(match[1]);
  const currentYear = new Date().getFullYear();

  if (year < 1950 || year > currentYear) {
    return `Registration year must be between 1950 and ${currentYear}.`;
  }

  return null;
};

export const toFormState = (profile) => {
  const basicInfo = profile?.basicInfo || {};
  const experience = profile?.experience || {};
  const contactInfo = basicInfo.contactInfo || {};
  const educationQualifications = profile?.educationQualifications || {};

  return {
    name: profile?.user?.name || "",
    professionalTitle: basicInfo.professionalTitle || "",
    bio: basicInfo.bio || "",
    totalYearsExperience:
      typeof experience.totalYearsExperience === "number"
        ? String(experience.totalYearsExperience)
        : "",
    isFree: Boolean(profile?.isFree),
    expertise:
      typeof profile?.expertise === "string" && profile.expertise
        ? profile.expertise
        : "general",
    phone: contactInfo.phone || "",
    officeAddress: contactInfo.officeAddress || "",
    location: contactInfo.location || "",
    languages: Array.isArray(basicInfo.languages) ? basicInfo.languages : [],
    practiceAreas: Array.isArray(basicInfo.practiceAreas) ? basicInfo.practiceAreas : [],
    barRegistrationNumber: profile?.barRegistrationNumber || "",
    memberships: listToCsv(profile?.memberships),
    education: Array.isArray(educationQualifications.education)
      ? educationQualifications.education
      : [],
    certifications: Array.isArray(educationQualifications.certifications)
      ? educationQualifications.certifications
      : [],
    workHistory: Array.isArray(experience.workHistory) ? experience.workHistory : [],
  };
};

export const toSectionPayload = (form, section) => {
  const parsedYears = form.totalYearsExperience.trim();
  const yearsValue = parsedYears === "" ? undefined : Number(parsedYears);

  if (section === "about") {
    return {
      basicInfo: {
        professionalTitle: form.professionalTitle.trim(),
        bio: form.bio.trim(),
      },
      experience: {
        ...(Number.isFinite(yearsValue) && yearsValue >= 0
          ? { totalYearsExperience: yearsValue }
          : {}),
      },
      expertise: form.expertise || "general",
      barRegistrationNumber: form.barRegistrationNumber.trim() || null,
      memberships: csvToList(form.memberships),
    };
  }

  if (section === "skills") {
    return {
      basicInfo: {
        languages: form.languages,
        practiceAreas: form.practiceAreas,
      },
      experience: {
        workHistory: form.workHistory,
      },
      isFree: form.isFree,
    };
  }

  if (section === "contact") {
    return {
      basicInfo: {
        contactInfo: {
          phone: form.phone.trim(),
          officeAddress: form.officeAddress.trim(),
          location: form.location.trim(),
        },
      },
    };
  }

  if (section === "qualifications") {
    return {
      barRegistrationNumber: form.barRegistrationNumber.trim() || null,
      memberships: csvToList(form.memberships),
      educationQualifications: {
        education: form.education,
        certifications: form.certifications,
      },
    };
  }

  return null;
};

export function useProfileForm() {
  const [form, setForm] = useState(DEFAULT_FORM);

  const onChange = useCallback((field) => (event) => {
    const value =
      event?.target?.type === "checkbox"
        ? event.target.checked
        : event?.target?.value ?? "";

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback((profile) => {
    setForm(profile ? toFormState(profile) : DEFAULT_FORM);
  }, []);

  const memoizedToSectionPayload = useMemo(() => toSectionPayload, []);

  return {
    form,
    setForm,
    onChange,
    resetForm,
    toSectionPayload: memoizedToSectionPayload,
  };
}
