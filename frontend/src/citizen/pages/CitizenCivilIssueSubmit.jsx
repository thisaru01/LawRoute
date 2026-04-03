import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CivilIssueSubmitForm from "@/citizen/components/civil-issues/CivilIssueSubmitForm.jsx";

export default function CitizenCivilIssueSubmit() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/citizen/civil-issues/pending")}
        className="mb-4 -ml-2 text-sm sm:mb-6 sm:-ml-3 sm:text-base"
      >
        ← Back to civil issues
      </Button>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-xl">
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 sm:text-3xl">Report a Civil Issue</h1>
        <CivilIssueSubmitForm
          onCancel={() => navigate("/citizen/civil-issues/pending")}
          onSuccess={() => navigate("/citizen/civil-issues/pending")}
        />
      </div>
    </div>
  );
}
