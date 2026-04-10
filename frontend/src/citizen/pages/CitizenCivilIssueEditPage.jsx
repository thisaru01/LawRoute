import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CivilIssueSubmitForm from "@/citizen/components/civil-issues/CivilIssueSubmitForm.jsx";
import { getCivilIssueById } from "@/api/services/civilIssueService";

export default function CitizenCivilIssueEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadIssue = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getCivilIssueById(id);
        if (!active) {
          return;
        }

        setIssue(res?.data?.data || null);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err?.message || "Unable to load this civil issue.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadIssue();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-lg sm:rounded-2xl sm:p-8 sm:shadow-xl">
          Loading issue details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-lg sm:rounded-2xl sm:p-6 sm:shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-3">
              <p>{error}</p>
              <Button variant="outline" onClick={() => navigate("/citizen/civil-issues/pending")}>
                Back to civil issues
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue || issue.status !== "pending") {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-lg sm:rounded-2xl sm:p-6 sm:shadow-xl">
          <div className="space-y-3">
            <p>Only pending civil issues can be updated.</p>
            <Button variant="outline" onClick={() => navigate("/citizen/civil-issues/pending")}>
              Back to pending issues
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/citizen/civil-issues/pending")}
        className="mb-4 -ml-2 text-sm sm:mb-6 sm:-ml-3 sm:text-base"
      >
        Back to civil issues
      </Button>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8 sm:shadow-xl">
        <div className="mb-5 space-y-2 sm:mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Update Civil Issue</h1>
          <p className="text-sm text-slate-500 sm:text-base">
            You can adjust the report details while this issue is still pending. Category, attachments, and public visibility cannot be changed here.
          </p>
        </div>

        <CivilIssueSubmitForm
          mode="edit"
          issueId={id}
          initialData={issue}
          onCancel={() => navigate("/citizen/civil-issues/pending")}
          onSuccess={() => navigate("/citizen/civil-issues/pending")}
        />
      </div>
    </div>
  );
}
