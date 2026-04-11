import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Dashboard stat card with gradient accent, big number, and breakdown pills.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  href,
  gradient,
  breakdowns,
}) {
  return (
    <Link to={href} id={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${gradient.split(",")[0]?.replace("linear-gradient(135deg,", "").trim() || "#6366f1"}15, ${gradient.split(",")[0]?.replace("linear-gradient(135deg,", "").trim() || "#6366f1"}25)`,
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{
                  color:
                    gradient
                      .split(",")[0]
                      ?.replace("linear-gradient(135deg,", "")
                      .trim() || "#6366f1",
                }}
              />
            </div>
          </div>

          {/* Mini breakdown pills */}
          {breakdowns && breakdowns.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {breakdowns.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  {b.count} {b.label}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
