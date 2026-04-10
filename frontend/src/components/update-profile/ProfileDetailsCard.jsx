import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { updateMe } from "@/api/services/userService";
import { toast } from "sonner";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";

export default function ProfileDetailsCard() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  async function performNameUpdate() {
    if (!user || !name || name.trim() === user.name) return;

    setIsSavingName(true);
    try {
      const response = await updateMe({ name: name.trim() });
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      }
      toast.success("Name updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  }

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
        <CardDescription>
          Update your name. Your email is read-only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4 max-w-md"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled readOnly />
          </div>

          <div className="flex gap-2">
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    isSavingName ||
                    !name ||
                    name.trim() === "" ||
                    name.trim() === user.name
                  }
                >
                  {isSavingName ? "Saving..." : "Save changes"}
                </Button>
              }
              title="Confirm name change"
              description={`Change your name to "${name.trim()}"?`}
              confirmLabel="Save"
              confirmClass="bg-slate-900 text-white"
              onConfirm={performNameUpdate}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
