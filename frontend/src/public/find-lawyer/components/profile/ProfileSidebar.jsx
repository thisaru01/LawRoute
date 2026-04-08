import { Mail, Phone, MapPin, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileSidebar({ 
  user, 
  isAuthenticated, 
  contactInfo, 
  basicInfo, 
  educationQualifications, 
  barRegistrationNumber, 
  memberships,
  navigate,
  onRequestConsultation
}) {
  return (
    <Card className="border-none shadow-sm sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onRequestConsultation} 
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Request Consultation
        </Button>

        <Separator className="my-2" />

        {isAuthenticated ? (
           <>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            {contactInfo.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                  <p className="text-sm font-medium">{contactInfo.phone}</p>
                </div>
              </div>
            )}
            {contactInfo.officeAddress && (
              <div className="flex items-start gap-3 pt-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Office Address</p>
                  <p className="text-sm font-medium leading-tight">{contactInfo.officeAddress}</p>
                </div>
              </div>
            )}
           </>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-center border border-dashed border-slate-200">
            <p className="text-xs text-muted-foreground mb-3">Sign in to view contact details</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="w-full">
              Sign In
            </Button>
          </div>
        )}

        <Separator />

        {/* Languages */}
        {basicInfo.languages?.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase font-semibold">Languages</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {basicInfo.languages.map((lang, idx) => (
                  <Badge key={idx} variant="outline" className="px-2 py-0 font-normal">
                    {lang}
                  </Badge>
                ))}
             </div>
          </div>
        )}

        {/* Certifications */}
        {educationQualifications.certifications?.length > 0 && (
          <div className="space-y-3 pt-4">
             <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-muted-foreground uppercase font-semibold">Certifications</p>
             </div>
             <div className="space-y-3">
                {educationQualifications.certifications.map((cert, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold leading-tight">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Memberships */}
        {Boolean(memberships?.length) && (
          <div className="space-y-3 pt-4">
             <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-muted-foreground uppercase font-semibold">Memberships</p>
             </div>
             <div className="flex flex-wrap gap-2">
                {memberships.map((membership, idx) => (
                  <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                    {membership}
                  </Badge>
                ))}
             </div>
          </div>
        )}

        {/* Bar Registration */}
        {barRegistrationNumber && (
           <div className="pt-4 mt-4 border-t space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">Legal Verification</p>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-muted-foreground">Bar Reg Number</p>
                <p className="text-sm font-mono font-bold mt-1 uppercase">{barRegistrationNumber}</p>
              </div>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
