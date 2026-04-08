import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProfileAbout({ basicInfo }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {basicInfo.bio || "No biography provided."}
        </p>
        
        {basicInfo.practiceAreas?.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Practice Areas</h4>
            <div className="flex flex-wrap gap-2">
              {basicInfo.practiceAreas.map((area, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  {typeof area === 'string' ? area : area.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
