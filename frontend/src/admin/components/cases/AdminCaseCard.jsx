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

  const lawyerMeta = lawyer?.name
    ? `Lawyer: ${lawyer.name}${lawyer.email ? ` · ${lawyer.email}` : ""}`
    : null;

  return (
    <CaseCard
      caseItem={caseItem}
      clickable={clickable}
      onClick={onClick}
      primaryPerson={citizen}
      meta={lawyerMeta}
    />
  );
}
