import { useAuth } from "@/context/auth/useAuth";
import AccountCard from "@/components/update-profile/AccountCard";
import ProfileDetailsCard from "@/components/update-profile/ProfileDetailsCard";
import ChangePasswordCard from "@/components/update-profile/ChangePasswordCard";

export default function CitizenProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading your account details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)] lg:grid-cols-[auto,minmax(0,2fr)]">
        <AccountCard />

        <ProfileDetailsCard />

        <ChangePasswordCard />
      </div>
    </div>
  );
}
