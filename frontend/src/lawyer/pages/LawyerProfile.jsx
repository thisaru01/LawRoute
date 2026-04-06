import { useCallback, useEffect, useState } from "react";

import {
  getMyLawyerProfile,
  updateMyLawyerProfile,
} from "@/api/services/lawyerProfileService";
import { updateMe, updateProfilePhoto } from "@/api/services/userService";
import LawyerProfileDetails from "@/lawyer/components/profile/LawyerProfileDetails";

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

const toFormState = (profile) => {
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

const toSectionPayload = (form, section) => {
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

export default function LawyerProfile() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [profile, setProfile] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess("");

    try {
      const response = await getMyLawyerProfile();
      const profile = response?.data?.lawyerProfile;

      setProfile(profile || null);
      setForm(toFormState(profile));
      setProfileCompleted(Boolean(profile?.profileCompleted));
    } catch (err) {
      setError(err);
      setForm(DEFAULT_FORM);
      setProfile(null);
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

  const onSaveSection = async (section) => {
    setSavingSection(section);
    setError(null);
    setSuccess("");

    try {
      const payload = toSectionPayload(form, section);
      if (!payload) return;

      // If saving About section, also update user name via separate endpoint
      if (section === "about" && form.name.trim()) {
        await updateMe({ name: form.name.trim() });
      }

      await updateMyLawyerProfile(payload);

      // Re-fetch to get fully populated profile (with user.name, etc.)
      const refreshed = await getMyLawyerProfile();
      const updatedProfile = refreshed?.data?.lawyerProfile;

      setProfile(updatedProfile || null);
      setForm(toFormState(updatedProfile));
      setProfileCompleted(Boolean(updatedProfile?.profileCompleted));
      setSuccess("Section updated successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setSavingSection("");
    }
  };

  const onUploadPhoto = async (file) => {
    if (!file) return;

    setIsUploadingPhoto(true);
    setError(null);
    setSuccess("");

    try {
      const response = await updateProfilePhoto(file);
      const updatedPhoto = response?.data?.user?.profilePhoto || "";

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...(prev.user || {}),
            profilePhoto: updatedPhoto,
          },
        };
      });

      setSuccess("Profile photo updated successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <LawyerProfileDetails
      profile={profile}
      form={form}
      isLoading={isLoading}
      savingSection={savingSection}
      error={error}
      success={success}
      profileCompleted={profileCompleted}
      isUploadingPhoto={isUploadingPhoto}
      onRetry={loadProfile}
      onChange={onChange}
      onSaveSection={onSaveSection}
      onUploadPhoto={onUploadPhoto}
    />
  );
}
