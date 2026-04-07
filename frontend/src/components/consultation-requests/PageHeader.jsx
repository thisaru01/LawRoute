import { Badge } from "@/components/ui/badge";

/**
 * Shared page header used by LawyerCases and LawyerConsultationRequests.
 * @param {string} title       - Main heading text
 * @param {string} badgeLabel  - Text inside the status badge
 * @param {string} badgeClass  - Tailwind classes for badge colour
 */
export default function PageHeader({ title, badgeLabel, badgeClass }) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {badgeLabel && (
        <Badge className={badgeClass}>{badgeLabel}</Badge>
      )}
    </div>
  );
}
