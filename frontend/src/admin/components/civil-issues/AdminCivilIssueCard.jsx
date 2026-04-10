import { useState } from "react";
import IssueCard from "@/public/civil-issues/components/IssueCard.jsx";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants";
import CivilIssueActionButtons from "@/components/civil-issues/CivilIssueActionButtons";

/**
 * Admin-specific wrapper for the Civil Issue Card.
 * Uses Composition to extend the base IssueCard with administrative actions.
 */
const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map(({ value, label }) => [value, label])
);

export default function AdminCivilIssueCard({ issue, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <IssueCard
      issue={issue}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      categoryLabels={CATEGORY_LABELS}
      showContactNumber={true} // Admins always see contact numbers for triage
      reporterLabel={issue.reporterId?.name || "Anonymous Citizen"}
      footerContent={<CivilIssueActionButtons issue={issue} onRefresh={onRefresh} />}
    />
  );
}
