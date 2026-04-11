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

import { 
  AlertCircle, 
  AlertTriangle, 
  Building2, 
  Camera, 
  CheckCircle2, 
  Clock,
  MapPin, 
  ShieldCheck,
  XCircle 
} from "lucide-react";

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

const MEMBERSHIP_OPTIONS = [
  { value: "Bar Association of Sri Lanka (BASL)", label: "Bar Association of Sri Lanka (BASL)" },
  { value: "International Bar Association (IBA)", label: "International Bar Association (IBA)" },
  { value: "LAWASIA", label: "LAWASIA" },
  { value: "Colombo Law Society", label: "Colombo Law Society" },
  { value: "Asian Society of International Law", label: "Asian Society of International Law" },
  { value: "World Jurist Association", label: "World Jurist Association" },
  { value: "Chartered Institute of Arbitrators (CIArb)", label: "Chartered Institute of Arbitrators (CIArb)" },
];

const LANGUAGE_OPTIONS = [
  { value: "Sinhala", label: "Sinhala" },
  { value: "Tamil", label: "Tamil" },
  { value: "English", label: "English" },
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
              <AlertTriangle className="h-5 w-5 text-amber-600" />
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
              <XCircle className="h-5 w-5 text-red-600" />
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
                  <Camera className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                </button>
              </div>

              <div className="space-y-2 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{displayName}</h1>
                    {verificationStatus === "approved" && (
                      <div className="text-blue-500" title="Verified Lawyer">
                        <CheckCircle2 className="w-6 h-6 fill-blue-50 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-medium text-blue-600/90">{profile?.basicInfo?.professionalTitle || form.professionalTitle || "Attorney at Law"}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{profile?.expertise || "General"} Law Expert</span>
                  </div>
                  {profile?.totalYearsExperience > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{profile.totalYearsExperience}+ Years Experience</span>
                    </div>
                  )}
                  {profile?.basicInfo?.contactInfo?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-red-500" />
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
            MEMBERSHIP_OPTIONS={MEMBERSHIP_OPTIONS}
            isVerified={verificationStatus === "approved"}
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
            onRetry={onRetry}
            LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
          />

          <QualificationsSection
            form={form}
            isEditing={isEditingQualifications}
            isSaving={isSectionSaving("qualifications")}
            onChange={onChange}
            onSave={onSaveSection}
            setIsEditing={setIsEditingQualifications}
            onRetry={onRetry}
          />

        </div>
      </div>
    </div>
  );
}
