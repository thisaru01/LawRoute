import IssueCard from "@/public/civil-issues/components/IssueCard.jsx";
import CivilIssueActionButtons from "@/components/civil-issues/CivilIssueActionButtons";

export default function AuthorityCivilIssueCard({ onRefresh, ...props }) {
  return (
    <IssueCard 
      {...props} 
      showContactNumber 
      footerContent={<CivilIssueActionButtons issue={props.issue} onRefresh={onRefresh} />}
    />
  );
}