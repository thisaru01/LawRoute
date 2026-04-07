import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/useAuth";
import { useLawyerProfile } from "./hooks/useLawyerProfile";

import ProfileHero from "./components/profile/ProfileHero";
import ProfileAbout from "./components/profile/ProfileAbout";
import ProfileExperience from "./components/profile/ProfileExperience";
import ProfileSidebar from "./components/profile/ProfileSidebar";
import RequestConsultationModal from "./components/RequestConsultationModal";
import { EXPERTISE_LABELS } from "./components/LawyerCard";
import { useState } from "react";

export default function PublicLawyerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { lawyer, isLoading, error } = useLawyerProfile(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="container mx-auto max-w-2xl py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-8">{error || "Lawyer profile not found"}</p>
        <Button onClick={() => navigate("/find-a-lawyer")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  const user = lawyer.user || {};
  const basicInfo = lawyer.basicInfo || {};
  const contactInfo = basicInfo.contactInfo || {};
  const experience = lawyer.experience || {};
  const educationQualifications = lawyer.educationQualifications || {};

  const initials = user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "L";

  const expertiseLabel = EXPERTISE_LABELS[lawyer.expertise] || lawyer.expertise || "General";

  const handleRequestConsultation = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/lawyers/${id}`);
    } else if (role !== "user") {
      alert("Only citizens can request a consultation.");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 pb-20">
      {/* Sticky Header for Actions */}
      <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/find-a-lawyer")} className="hidden sm:flex">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4 ml-auto">
            {/* Action items previously here have been moved to contextually appropriate sections */}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Side */}
          <div className="lg:col-span-8 space-y-8">

            {/* Profile Hero Card */}
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              <div className="h-32 w-full bg-primary/5 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
              </div>
              <ProfileHero
                user={user}
                lawyer={lawyer}
                basicInfo={basicInfo}
                experience={experience}
                initials={initials}
                expertiseLabel={expertiseLabel}
              />
            </Card>

            <ProfileAbout basicInfo={basicInfo} />

            <ProfileExperience
              experience={experience}
              educationQualifications={educationQualifications}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileSidebar
              user={user}
              isAuthenticated={isAuthenticated}
              contactInfo={contactInfo}
              basicInfo={basicInfo}
              educationQualifications={educationQualifications}
              barRegistrationNumber={lawyer.barRegistrationNumber}
              memberships={lawyer.memberships}
              navigate={navigate}
              onRequestConsultation={handleRequestConsultation}
            />
          </div>
        </div>
      </div>

      <RequestConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lawyerId={lawyer.user?._id || lawyer.user?.id}
        lawyerName={user.name}
      />
    </div>
  );
}
