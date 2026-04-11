import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import AuthorityCreationForm from "../components/authority/AuthorityCreationForm";
import AuthorityList from "../components/authority/AuthorityList";
import { getAdminAuthorityProfiles } from "@/api/services/adminAuthorityService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, RefreshCcw } from "lucide-react";

const allowedTypes = new Set(["authority", "lawyer"]);

export default function AdminUsers() {
  const { type } = useParams();
  const normalizedType = (type ?? "authority").toLowerCase();

  const safeType = allowedTypes.has(normalizedType)
    ? normalizedType
    : "authority";

  const isAuthority = safeType === "authority";

  // State for Authority Listing
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!isAuthority) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAuthorityProfiles();
      setProfiles(res?.data?.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load authority profiles");
    } finally {
      setLoading(false);
    }
  }, [isAuthority]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreateSuccess = () => {
    setIsDialogOpen(false);
    fetchProfiles();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage system users and service providers.</p>
        </div>

        {isAuthority && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfiles}
              disabled={loading}
              className="h-9"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Create Authority
            </Button>
          </div>
        )}
      </div>

      {isAuthority && (
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <AuthorityList profiles={profiles} loading={loading} onRefresh={fetchProfiles} />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Authority Profile</DialogTitle>
                <DialogDescription>
                  Registration for new officials managing specific civil issue categories.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <AuthorityCreationForm onSuccess={handleCreateSuccess} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {!isAuthority && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Lawyer management interface coming soon.</p>
        </div>
      )}
    </div>
  );
}
