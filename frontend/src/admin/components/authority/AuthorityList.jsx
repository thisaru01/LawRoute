import React, { useMemo, useState } from "react";
import { Filter, Mail, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";
import UpdateAuthorityPasswordModal from "./UpdateAuthorityPasswordModal";
import { deleteAdminAuthority } from "@/api/services/adminAuthorityService";
import { toast } from "sonner";

export default function AuthorityList({ profiles, loading, onRefresh }) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const getCategoryLabel = (value) => {
    return CIVIL_ISSUE_CATEGORIES.find((cat) => cat.value === value)?.label || value;
  };

  const handleDelete = async (profileId) => {
    try {
      await deleteAdminAuthority(profileId);
      toast.error("Authority profile and associated user deleted successfully.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete authority", err);
      toast.error(err.response?.data?.message || "Failed to delete authority profile.");
    }
  };

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    if (categoryFilter === "all") return profiles;
    return profiles.filter((p) => p.managedCategory === categoryFilter);
  }, [profiles, categoryFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-slate-200">
            <CardContent className="p-6 h-32 bg-slate-50/50" />
          </Card>
        ))}
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <ShieldCheck className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-slate-900">No Authorities Registered</h3>
        <p className="mt-1 text-sm text-slate-500">
          Start by onboarding a new official to manage civil issues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Filter className="h-4 w-4 text-slate-400" />
          Filter by Category
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] h-9 bg-slate-50 border-slate-200 text-sm focus:ring-indigo-500">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CIVIL_ISSUE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryFilter === "other" ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <ShieldCheck className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">System Managed Category</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            Issues in the <strong>'Other'</strong> category are permanently managed by the 
            System Administrator. Standard authority profiles do not cover this area.
          </p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center">
          <p className="text-sm text-slate-500">No authorities found in this category.</p>
          <button 
            onClick={() => setCategoryFilter("all")}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <Card key={profile._id} className="group overflow-hidden border-slate-200 transition-all hover:border-slate-300 hover:shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        {profile.user?.profilePhoto ? (
                          <img 
                            src={profile.user.profilePhoto} 
                            alt={profile.user.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{profile.user?.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3" />
                          {profile.user?.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UpdateAuthorityPasswordModal 
                        profileId={profile._id} 
                        authorityName={profile.user?.name}
                        onSuccess={onRefresh}
                      />

                      <ConfirmDialog
                        title="Delete Authority Profile?"
                        description={`This will permanently delete the profile for ${profile.user?.name} and their associated user account. This action cannot be undone.`}
                        confirmLabel="Delete"
                        confirmClass="bg-red-600 hover:bg-red-700 text-white"
                        onConfirm={() => handleDelete(profile._id)}
                        trigger={
                          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Managed Category
                    </span>
                    <Badge variant="secondary" className="w-fit bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none px-2.5 py-0.5 text-xs font-medium">
                      {getCategoryLabel(profile.managedCategory)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
