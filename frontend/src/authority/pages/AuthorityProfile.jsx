import AccountCard from "@/components/update-profile/AccountCard";
import AuthorityDetailsCard from "@/components/update-profile/AuthorityDetailsCard";
import ChangePasswordCard from "@/components/update-profile/ChangePasswordCard";

export default function AuthorityProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your authority profile settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)] lg:grid-cols-[auto,minmax(0,2fr)]">
        {/* Profile Photo */}
        <AccountCard />

        <div className="space-y-6 lg:max-w-4xl">
          {/* Identity & Org Info (Read Only) */}
          <AuthorityDetailsCard />

          {/* Security (Editable) */}
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
