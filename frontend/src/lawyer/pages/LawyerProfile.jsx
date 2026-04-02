import { useCallback, useEffect, useState } from "react";

import {
  getMyLawyerProfile,
  updateMyLawyerProfile,
} from "@/api/services/lawyerProfileService";
import LawyerProfileDetails from "@/lawyer/components/profile/LawyerProfileDetails";

const DEFAULT_FORM = {
  professionalTitle: "",
  bio: "",
  totalYearsExperience: "",
  isFree: false,
  phone: "",
  officeAddress: "",
  location: "",
  languages: "",
  practiceAreas: "",
  barRegistrationNumber: "",
  memberships: "",
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

const toFormState = (profile) => {
  const basicInfo = profile?.basicInfo || {};
  const experience = profile?.experience || {};
  const educationQualifications = profile?.educationQualifications || {};
  const contactInfo = basicInfo.contactInfo || {};

  return {
    professionalTitle: basicInfo.professionalTitle || "",
    bio: basicInfo.bio || "",
    totalYearsExperience:
      typeof experience.totalYearsExperience === "number"
        ? String(experience.totalYearsExperience)
        : "",
    isFree: Boolean(profile?.isFree),
    phone: contactInfo.phone || "",
    officeAddress: contactInfo.officeAddress || "",
    location: contactInfo.location || "",
    languages: listToCsv(basicInfo.languages),
    practiceAreas: listToCsv(basicInfo.practiceAreas),
    barRegistrationNumber: educationQualifications.barRegistrationNumber || "",
    memberships: listToCsv(educationQualifications.memberships),
  };
};

const toUpdatePayload = (form) => {
  const parsedYears = form.totalYearsExperience.trim();
  const yearsValue = parsedYears === "" ? undefined : Number(parsedYears);

  return {
    isFree: Boolean(form.isFree),
    basicInfo: {
      professionalTitle: form.professionalTitle.trim(),
      bio: form.bio.trim(),
      languages: csvToList(form.languages),
      practiceAreas: csvToList(form.practiceAreas).map((name) => ({
        name,
        level: "intermediate",
      })),
      contactInfo: {
        phone: form.phone.trim(),
        officeAddress: form.officeAddress.trim(),
        location: form.location.trim(),
      },
    },
    experience: {
      ...(Number.isFinite(yearsValue) && yearsValue >= 0
        ? { totalYearsExperience: yearsValue }
        : {}),
    },
    educationQualifications: {
      barRegistrationNumber: form.barRegistrationNumber.trim(),
      memberships: csvToList(form.memberships),
    },
  };
};

export default function LawyerProfile() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess("");

    try {
      const response = await getMyLawyerProfile();
      const profile = response?.data?.lawyerProfile;

      setForm(toFormState(profile));
      setProfileCompleted(Boolean(profile?.profileCompleted));
    } catch (err) {
      setError(err);
      setForm(DEFAULT_FORM);
      setProfileCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onChange = (field) => (event) => {
    const value =
      event?.target?.type === "checkbox"
        ? event.target.checked
        : event?.target?.value ?? "";

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess("");

    try {
      const payload = toUpdatePayload(form);
      const response = await updateMyLawyerProfile(payload);
      const updatedProfile = response?.data?.lawyerProfile;

      setForm(toFormState(updatedProfile));
      setProfileCompleted(Boolean(updatedProfile?.profileCompleted));
      setSuccess("Profile details saved successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LawyerProfileDetails
      form={form}
      isLoading={isLoading}
      isSaving={isSaving}
      error={error}
      success={success}
      profileCompleted={profileCompleted}
      onRetry={loadProfile}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
