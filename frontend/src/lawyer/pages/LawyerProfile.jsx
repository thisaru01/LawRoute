import { useProfileForm, validateBarNumber } from "@/hooks/lawyer/useProfileForm";
import { useProfileData } from "@/hooks/lawyer/useProfileData";
import { toast } from "sonner";
import LawyerProfileDetails from "@/lawyer/components/profile/LawyerProfileDetails";

export default function LawyerProfile() {
  const { form, onChange, resetForm, toSectionPayload } = useProfileForm();
  
  const {
    profile,
    profileCompleted,
    isLoading,
    savingSection,
    isUploadingPhoto,
    error,
    success,
    loadProfile,
    saveSection,
    uploadPhoto,
  } = useProfileData(resetForm);

  const onSaveSection = async (section) => {
    // 1. Validation Logic
    if (section === "about") {
      const barError = validateBarNumber(form.barRegistrationNumber);
      if (barError) {
        toast.error("Validation Failed", {
          description: barError,
        });
        return;
      }
    }

    const payload = toSectionPayload(form, section);
    if (!payload) return;

    await saveSection(section, payload, section === "about" ? form.name : null);
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
      onUploadPhoto={uploadPhoto}
    />
  );
}

