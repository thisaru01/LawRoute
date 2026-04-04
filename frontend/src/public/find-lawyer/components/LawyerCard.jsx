import { MapPin, Clock, Star, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/auth/useAuth";
import RequestConsultationModal from "./RequestConsultationModal";

//  Expertise display map 
export const EXPERTISE_LABELS = {
  general: "General",
  civil: "Civil Law",
  criminal: "Criminal Law",
  commercial: "Commercial Law",
  corporate: "Corporate Law",
  family: "Family Law",
  land: "Land Law",
  labour: "Labour Law",
  tax: "Tax Law",
  constitutional: "Constitutional Law",
  administrative: "Administrative Law",
  environmental: "Environmental Law",
  intellectual_property: "Intellectual Property",
};

const EXPERTISE_COLORS = {
  general:           "bg-slate-100    text-slate-700   dark:bg-slate-800   dark:text-slate-300",
  civil:             "bg-blue-50      text-blue-700    dark:bg-blue-950    dark:text-blue-300",
  criminal:          "bg-red-50       text-red-700     dark:bg-red-950     dark:text-red-300",
  commercial:        "bg-amber-50     text-amber-700   dark:bg-amber-950   dark:text-amber-300",
  corporate:         "bg-violet-50    text-violet-700  dark:bg-violet-950  dark:text-violet-300",
  family:            "bg-pink-50      text-pink-700    dark:bg-pink-950    dark:text-pink-300",
  land:              "bg-green-50     text-green-700   dark:bg-green-950   dark:text-green-300",
  labour:            "bg-orange-50    text-orange-700  dark:bg-orange-950  dark:text-orange-300",
  tax:               "bg-teal-50      text-teal-700    dark:bg-teal-950    dark:text-teal-300",
  constitutional:    "bg-indigo-50    text-indigo-700  dark:bg-indigo-950  dark:text-indigo-300",
  administrative:    "bg-cyan-50      text-cyan-700    dark:bg-cyan-950    dark:text-cyan-300",
  environmental:     "bg-emerald-50   text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  intellectual_property: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
};

//  Helpers 
function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function getPracticeAreaNames(areas = []) {
  if (!Array.isArray(areas)) return [];
  return areas
    .map((a) => (typeof a === "string" ? a : a?.name))
    .filter(Boolean)
    .slice(0, 4);
}

//  Component 
/**
 * Public-facing lawyer directory card.
 * @param {{ lawyer: object }} props
 */
export default function LawyerCard({ lawyer }) {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const name            = lawyer?.user?.name || "—";
  const photo           = lawyer?.user?.profilePhoto || "";
  const title           = lawyer?.basicInfo?.professionalTitle || "";
  const bio             = lawyer?.basicInfo?.bio || "";
  const expertise       = lawyer?.expertise || "general";
  const isFree          = Boolean(lawyer?.isFree);
  const years           = lawyer?.experience?.totalYearsExperience ?? null;
  const location        = lawyer?.basicInfo?.contactInfo?.location || "";
  const languages       = Array.isArray(lawyer?.basicInfo?.languages)
    ? lawyer.basicInfo.languages.slice(0, 3)
    : [];
  const practiceAreas   = getPracticeAreaNames(lawyer?.basicInfo?.practiceAreas);
  const initials        = getInitials(name);
  const expertiseLabel  = EXPERTISE_LABELS[expertise] || expertise;
  const expertiseColor  = EXPERTISE_COLORS[expertise] || EXPERTISE_COLORS.general;

  return (
    <Card className="flex flex-col gap-0 overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        {/*  Header: avatar + name + badges  */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0 text-base">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials || "L"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate font-semibold text-foreground">{name}</p>
              {isFree && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <BadgeCheck className="h-3 w-3" />
                  Free
                </span>
              )}
            </div>
            {title && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{title}</p>
            )}
          </div>
        </div>

        {/*  Expertise + experience  */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-[11px] font-medium ${expertiseColor}`}>
            {expertiseLabel}
          </Badge>

          {years !== null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {years} yr{years !== 1 ? "s" : ""} exp.
            </span>
          )}

          {location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          )}
        </div>

        {/*  Bio  */}
        {bio && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        )}

        {/*  Practice areas  */}
        {practiceAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {practiceAreas.map((area) => (
              <span
                key={area}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {area}
              </span>
            ))}
            {(lawyer?.basicInfo?.practiceAreas?.length ?? 0) > 4 && (
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                +{(lawyer?.basicInfo?.practiceAreas?.length ?? 0) - 4} more
              </span>
            )}
          </div>
        )}

        {/*  Languages  */}
        {languages.length > 0 && (
          <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 shrink-0" />
            <span>{languages.join(", ")}</span>
          </div>
        )}
      </CardContent>

      {/*  Actions / Footer  */}
      <CardFooter className="mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link to={`/lawyers/${lawyer?.id || ""}`}>View Profile</Link>
        </Button>
        <Button className="w-full sm:w-auto" onClick={() => {
          if (!isAuthenticated) {
            navigate("/auth?redirect=/find-a-lawyer");
          } else if (role !== "user") {
            // A more sophisticated toast could be used here; using basic alert for now
            alert("Only citizens can request a consultation.");
          } else {
            setIsModalOpen(true);
          }
        }}>
          Request Consultation
        </Button>
      </CardFooter>

      <RequestConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lawyerId={lawyer?.user?._id || lawyer?.user?.id}
        lawyerName={name}
      />
    </Card>
  );
}
