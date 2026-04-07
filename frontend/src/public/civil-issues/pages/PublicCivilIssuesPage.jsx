import Navbar from "@/components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, MapPin, Paperclip, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import IssueCard from "@/public/civil-issues/components/IssueCard.jsx";
import IssueFilters from "@/public/civil-issues/components/IssueFilters.jsx";
import EmptyState from "@/public/civil-issues/components/EmptyState.jsx";
import FloatingSubmitButton from "@/public/civil-issues/components/FloatingSubmitButton.jsx";
import CivilIssueSubmitForm from "@/citizen/components/civil-issues/CivilIssueSubmitForm.jsx";
import CivilIssueAwarenessDialog from "@/public/civil-issues/components/CivilIssueAwarenessDialog.jsx";
import { usePublicCivilIssuesPage } from "@/public/civil-issues/hooks/usePublicCivilIssuesPage.js";
import { useAuth } from "@/context/auth/useAuth";

export default function PublicCivilIssuesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const {
    CATEGORY_LABELS,
    DISTRICTS,
    error,
    filteredIssues,
    fetchIssues,
    filterCategory,
    filterDistrict,
    hasNextPage,
    handleLocationQueryChange,
    handleLocationSelect,
    handleDistrictChange,
    handleClearFilters,
    handleCloseForm,
    handleStartSubmission,
    loadNextPage,
    loadPreviousPage,
    loading,
    loadingPage,
    locationQuery,
    locationMessage,
    openIssues,
    page,
    setFilterCategory,
    setOpenIssues,
    showForm,
    totalPages,
  } = usePublicCivilIssuesPage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-50 py-12 sm:py-16 lg:py-20 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 space-y-12">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Public Civil Issues Feed</h2>
                <p className="text-sm sm:text-base text-slate-500">Explore concerns shared by fellow citizens across Sri Lanka.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <CivilIssueAwarenessDialog
                    selectedCategory={filterCategory !== "all" ? filterCategory : ""}
                    triggerLabel="Awareness Q&A"
                    triggerVariant="outline"
                    triggerClassName="h-9"
                  />
                  {isAuthenticated && role === "user" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 gap-2"
                      onClick={() => navigate("/citizen")}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Citizen Dashboard
                    </Button>
                  ) : null}
                </div>
              </div>

              <IssueFilters
                categories={CATEGORY_LABELS}
                districts={DISTRICTS}
                selectedCategory={filterCategory}
                selectedDistrict={filterDistrict}
                locationQuery={locationQuery}
                locationMessage={locationMessage}
                onCategoryChange={setFilterCategory}
                onDistrictChange={handleDistrictChange}
                onLocationQueryChange={handleLocationQueryChange}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-red-900">Unable to Load Issues</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchIssues}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-14 sm:py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-slate-500">Loading community issues...</p>
                </div>
              ) : filteredIssues.length > 0 ? (
                <>
                  {filteredIssues.map((issue) => {
                    const isOpen = Boolean(openIssues[issue._id]);
                    return (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        isOpen={isOpen}
                        onToggle={(nextOpen) =>
                          setOpenIssues((prev) => ({ ...prev, [issue._id]: nextOpen }))
                        }
                        categoryLabels={CATEGORY_LABELS}
                      />
                    );
                  })}

                  <div className="flex flex-col items-center gap-3 pt-2">
                    {totalPages > 0 ? (
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        Page {page} of {totalPages}
                      </p>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadPreviousPage}
                        disabled={page <= 1 || loadingPage}
                        className="h-11 min-w-28"
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadNextPage}
                        disabled={!hasNextPage || loadingPage}
                        className="h-11 min-w-28"
                      >
                        {loadingPage ? "Loading..." : hasNextPage ? "Next" : "No more"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-10 sm:py-12 pb-24 sm:pb-28">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">How This Helps</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                <MapPin className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="mb-1 text-sm font-semibold text-slate-800">Relevant to Your Area</h4>
              <p className="text-xs leading-relaxed text-slate-500">See and report issues using district plus a more specific location so concerns stay locally relevant.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                <Paperclip className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="mb-1 text-sm font-semibold text-slate-800">Clearer Reports</h4>
              <p className="text-xs leading-relaxed text-slate-500">Attachments and details help authorities understand issues faster.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                <Zap className="h-5 w-5 text-slate-500" />
              </div>
              <h4 className="mb-1 text-sm font-semibold text-slate-800">Faster Responses for You</h4>
              <p className="text-xs leading-relaxed text-slate-500">Your report reaches the right authority quickly, so updates come sooner.</p>
            </div>
          </div>
        </section>

        <FloatingSubmitButton onClick={handleStartSubmission} />

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-10">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
                <h3 className="text-lg font-semibold text-slate-900">Report a Civil Issue</h3>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[calc(100vh-7rem)] overflow-y-auto p-4 sm:p-6 lg:p-8">
                <CivilIssueSubmitForm
                  onCancel={handleCloseForm}
                  onSuccess={() => navigate("/citizen/civil-issues/pending")}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}
