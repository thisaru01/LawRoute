import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Quick-action link card with icon, title, and description.
 */
export default function QuickAction({
  icon: Icon,
  title,
  description,
  href,
  color,
}) {
  return (
    <Link to={href} id={`action-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-foreground/15 hover:-translate-y-0.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
