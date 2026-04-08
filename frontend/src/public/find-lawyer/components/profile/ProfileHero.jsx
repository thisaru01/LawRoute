import { Shield, Clock, MapPin, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";

export default function ProfileHero({ user, lawyer, basicInfo, experience, initials, expertiseLabel }) {
  return (
    <CardContent className="relative pt-0 px-6 pb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-2xl">
          <AvatarImage src={user.profilePhoto} alt={user.name} className="object-cover" />
          <AvatarFallback className="text-3xl font-bold bg-primary text-white rounded-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            {lawyer.verificationStatus === "approved" && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                <Shield className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          <p className="text-xl text-primary font-medium">{basicInfo.professionalTitle || "Attorney at Law"}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span>{expertiseLabel} Expert</span>
            </div>
            {experience.totalYearsExperience > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{experience.totalYearsExperience}+ Years Experience</span>
              </div>
            )}
            {basicInfo.contactInfo?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{basicInfo.contactInfo.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  );
}
