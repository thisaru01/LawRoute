import { Briefcase, GraduationCap, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProfileExperience({ experience, educationQualifications }) {
  const hasExperience = experience.workHistory?.length > 0;
  const hasEducation = educationQualifications.education?.length > 0;

  if (!hasExperience && !hasEducation) return null;

  return (
    <div className="space-y-8">
      {hasExperience && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.workHistory.map((work, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-6 last:pb-0">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-blue-500"></div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">{work.position}</h4>
                  <p className="text-primary font-medium">{work.lawFirm}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {work.startDate ? new Date(work.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''} 
                    {work.endDate ? ` - ${new Date(work.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ' - Present'}
                  </p>
                  {work.responsibilities && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {work.responsibilities}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasEducation && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {educationQualifications.education.map((edu, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institute}</p>
                  <p className="text-xs text-muted-foreground mt-1">{edu.graduationYear}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
