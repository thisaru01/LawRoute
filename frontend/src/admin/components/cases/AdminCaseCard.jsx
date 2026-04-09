import CaseCard from "@/lawyer/components/cases/CaseCard";

/**
 * AdminCaseCard
 * Wraps the shared CaseCard and shows the citizen as the
 * primary person while including lawyer details in the
 * summary line for quick scanning.
 */
export default function AdminCaseCard({ caseItem, clickable, onClick }) {
  const citizen = caseItem?.user;
  const lawyer = caseItem?.lawyer;

  const lawyerLabel = lawyer?.name
    ? `${lawyer.name}${lawyer.email ? ` \\u00b7 ${lawyer.email}` : ""}`
    : null;

  const enrichedCase = lawyerLabel
    ? {
        ...caseItem,
        consultationRequest: {
          ...caseItem?.consultationRequest,
          summary: `${caseItem?.consultationRequest?.summary || "(No summary)"} \\u2014 Lawyer: ${lawyerLabel}`,
        },
      }
    : caseItem;

  return (
    <CaseCard
      caseItem={enrichedCase}
      clickable={clickable}
      onClick={onClick}
      primaryPerson={citizen}
    />
  );
}
