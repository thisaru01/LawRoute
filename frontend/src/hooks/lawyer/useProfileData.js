import { useState, useCallback, useEffect } from "react";
import {
  getMyLawyerProfile,
  updateMyLawyerProfile,
} from "@/api/services/lawyerProfileService";
import { updateMe, updateProfilePhoto } from "@/api/services/userService";
import { toFormState } from "./useProfileForm";

export function useProfileData(resetForm) {
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
      const profileData = response?.data?.lawyerProfile;

      setProfile(profileData || null);
      setProfileCompleted(Boolean(profileData?.profileCompleted));
      
      if (resetForm) {
        resetForm(profileData);
      }
    } catch (err) {
      setError(err);
      setProfile(null);
      setProfileCompleted(false);
      if (resetForm) {
        resetForm(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resetForm]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveSection = async (section, payload, nameToUpdate) => {
    setSavingSection(section);
    setError(null);
    setSuccess("");

    try {
      // If saving About section, also update user name via separate endpoint
      if (section === "about" && nameToUpdate) {
        await updateMe({ name: nameToUpdate.trim() });
      }

      await updateMyLawyerProfile(payload);

      // Re-fetch to get fully populated profile (with user.name, etc.)
      const refreshed = await getMyLawyerProfile();
      const updatedProfile = refreshed?.data?.lawyerProfile;

      setProfile(updatedProfile || null);
      setProfileCompleted(Boolean(updatedProfile?.profileCompleted));
      
      if (resetForm) {
        resetForm(updatedProfile);
      }
      
      setSuccess("Section updated successfully.");
      return updatedProfile;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSavingSection("");
    }
  };

  const uploadPhoto = async (file) => {
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
      return updatedPhoto;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return {
    profile,
    profileCompleted,
    isLoading,
    savingSection,
    isUploadingPhoto,
    error,
    success,
    setSuccess,
    setError,
    loadProfile,
    saveSection,
    uploadPhoto,
  };
}
