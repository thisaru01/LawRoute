import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth/useAuth";

/**
 * AuthorityDetailsCard
 * Responsibility: Display read-only account and organization information for the authority.
 * Follows SOLID by separating viewing logic from editing (handled by ChangePasswordCard).
 */
export default function AuthorityDetailsCard() {
  const { user } = useAuth();

  if (!user) return null;

  // Format the managed category for display (e.g., "matrimonial_family" -> "Matrimonial & Family")
  const formatCategory = (cat) => {
    if (!cat) return "Not Assigned";
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" & ");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Authority details</CardTitle>
        <CardDescription>
          General account and organizational information. These details are read-only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-md">
          {/* Identity Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-600">Full name</Label>
              <Input
                id="name"
                value={user.name}
                disabled
                readOnly
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">Email Address</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                readOnly
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {/* Organizational Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-600">Account Type</Label>
                <div className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-indigo-600">
                  Government Authority
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-600">Assigned Category</Label>
                <div className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold capitalize text-slate-900">
                  {formatCategory(user.managedCategory)}
                </div>
                <p className="text-[10px] text-slate-400">
                  The primary category assigned to your triage queue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
