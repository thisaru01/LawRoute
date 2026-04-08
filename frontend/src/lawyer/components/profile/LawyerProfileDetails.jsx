import { useRef, useState, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AboutSection from "./sections/AboutSection";
import ContactSection from "./sections/ContactSection";
import ExpertiseSection from "./sections/ExpertiseSection";
import QualificationsSection from "./sections/QualificationsSection";

const EXPERTISE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "commercial", label: "Commercial" },
  { value: "corporate", label: "Corporate" },
  { value: "family", label: "Family" },
  { value: "land", label: "Land" },
  { value: "labour", label: "Labour" },
  { value: "tax", label: "Tax" },
  { value: "constitutional", label: "Constitutional" },
  { value: "administrative", label: "Administrative" },
  { value: "environmental", label: "Environmental" },
  { value: "intellectual_property", label: "Intellectual Property" },
];

const loadingCard = (
  <Card className="mt-6">
    <CardHeader>
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-4 w-40" />
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full md:col-span-2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default function LawyerProfileDetails({
  profile,
  form,
  isLoading,
  savingSection,
  error,
  success,
  profileCompleted,
  isUploadingPhoto,
  onRetry,
  onChange,
  onSaveSection,
  onUploadPhoto,
}) {
  const user = profile?.user || {};
  const displayName = user.name || "Lawyer";
  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Lawyer";
  const headline =
    form.bio?.trim()?.split("\n")[0] ||
    profile?.basicInfo?.bio?.trim()?.split("\n")[0] ||
    "Add a short professional headline to make your profile stand out.";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const membershipsText = Array.isArray(profile?.memberships)
    ? profile.memberships.filter(Boolean).join(", ")
    : "";

  const verificationStatus = profile?.verificationStatus || "pending";
  const isVerificationPending = verificationStatus === "pending";
  const isVerificationRejected = verificationStatus === "rejected";

  const isSectionSaving = (section) => savingSection === section;
  const photoInputRef = useRef(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingQualifications, setIsEditingQualifications] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  const prevSavingRef = useRef("");

  useEffect(() => {
    // when save for about finished without error, close edit mode
    if (prevSavingRef.current === "about" && savingSection === "" && !error) {
      setIsEditingAbout(false);
    }
    // when save for contact finished without error, close edit mode
    if (prevSavingRef.current === "contact" && savingSection === "" && !error) {
      setIsEditingContact(false);
    }
    // when save for skills finished without error, close edit mode
    if (prevSavingRef.current === "skills" && savingSection === "" && !error) {
      setIsEditingSkills(false);
    }
    // when save for qualifications finished without error, close edit mode
    if (prevSavingRef.current === "qualifications" && savingSection === "" && !error) {
      setIsEditingQualifications(false);
    }
    prevSavingRef.current = savingSection;
  }, [savingSection, error]);

  const onClickEditPhoto = () => {
    if (isUploadingPhoto) return;
    photoInputRef.current?.click();
  };

  const onPhotoFileChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    await onUploadPhoto?.(file);

    if (event?.target) {
      event.target.value = "";
    }
  };

  const handleAddEducation = () => {
    // These handlers are now managed within their respective section components.
    // Parent maintains core state updates via onChange prop.
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile Details</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading lawyer profile...
          </p>
        </div>
        {loadingCard}
      </div>
    );
  }

  if (!profile && error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle>Unable to load profile</CardTitle>
              <CardDescription>There was a problem loading your lawyer profile.</CardDescription>
            </div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => onRetry && onRetry()}>
                Retry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error?.message || "Request failed"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Alert */}
      {isVerificationPending && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Account Not Verified</h3>
              <p className="mt-1 text-sm text-amber-800">Your account is pending verification. An administrator will review your profile and verify your credentials. Please complete your profile with all required information.</p>
            </div>
          </div>
        </div>
      )}

      {isVerificationRejected && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Verification Rejected</h3>
              <p className="mt-1 text-sm text-red-800">Your account verification was rejected. Please contact support or complete additional verification steps.</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Banner Background */}
        <div className="h-32 w-full bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-50 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        <div className="px-6 pb-6 relative -mt-12 md:-mt-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-44 md:h-44 border-4 border-white shadow-md">
                  <AvatarImage src={user.profilePhoto || ""} alt={displayName} />
                  <AvatarFallback className="text-3xl font-semibold bg-blue-600 text-white">
                    {initials || "L"}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoFileChange}
                />
                <button
                  type="button"
                  onClick={onClickEditPhoto}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 border border-gray-100 transition-all hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed group"
                  aria-label="Edit profile image"
                >
                  <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{displayName}</h1>
                    {verificationStatus === "approved" && (
                      <div className="text-blue-500" title="Verified Lawyer">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-medium text-blue-600/90">{profile?.basicInfo?.professionalTitle || form.professionalTitle || "Attorney at Law"}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {membershipsText && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{membershipsText}</span>
                    </div>
                  )}
                  {profile?.basicInfo?.contactInfo?.location && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{profile.basicInfo.contactInfo.location}</span>
                    </div>
                  )}
                </div>

                <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed mt-2 italic border-l-2 border-blue-100 pl-4">
                  "{headline}"
                </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 items-center md:items-end">
              <Badge
                variant="outline"
                className={
                  profileCompleted
                    ? "bg-green-50 text-green-700 border-green-200 px-3 py-1 text-xs font-semibold rounded-full"
                    : "bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-xs font-semibold rounded-full"
                }
              >
                {profileCompleted ? "Profile Complete" : "Incomplete Profile"}
              </Badge>
              <Badge
                variant="outline"
                className={
                  verificationStatus === "approved"
                    ? "bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs font-semibold rounded-full"
                    : verificationStatus === "rejected"
                      ? "bg-red-50 text-red-700 border-red-200 px-3 py-1 text-xs font-semibold rounded-full"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 text-xs font-semibold rounded-full"
                }
              >
                {verificationStatus === "approved"
                  ? "Verified Member"
                  : verificationStatus === "rejected"
                    ? "Verification Failed"
                    : "Verification Pending"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-12">
          <AboutSection
            form={form}
            isEditing={isEditingAbout}
            isSaving={isSectionSaving("about")}
            onChange={onChange}
            onSave={onSaveSection}
            setIsEditing={setIsEditingAbout}
            onRetry={onRetry}
            EXPERTISE_OPTIONS={EXPERTISE_OPTIONS}
          />

          <ContactSection
            form={form}
            isEditing={isEditingContact}
            isSaving={isSectionSaving("contact")}
            onChange={onChange}
            onSave={onSaveSection}
            setIsEditing={setIsEditingContact}
            onRetry={onRetry}
          />

          <ExpertiseSection
            form={form}
            isEditing={isEditingSkills}
            isSaving={isSectionSaving("skills")}
            onChange={onChange}
            onSave={onSaveSection}
            setIsEditing={setIsEditingSkills}
          />

          <QualificationsSection
            form={form}
            isEditing={isEditingQualifications}
            isSaving={isSectionSaving("qualifications")}
            onChange={onChange}
            onSave={onSaveSection}
            setIsEditing={setIsEditingQualifications}
          />

          {error ? (
            <p className="text-sm text-destructive">
              {error?.message || "Request failed"}
            </p>
          ) : null}

          {success ? <p className="text-sm text-green-700">{success}</p> : null}
        </div>
      </div>
    </div>
  );
}
