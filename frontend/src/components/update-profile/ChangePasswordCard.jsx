import { useState } from "react";

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
import { changePassword } from "@/api/services/userService";
import { toast } from "sonner";

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!currentPassword || !newPassword) return;
            if (newPassword.length < 8) {
              toast.error("New password must be at least 8 characters");
              return;
            }
            if (newPassword !== confirmNewPassword) {
              toast.error("New passwords do not match");
              return;
            }

            setIsChangingPassword(true);
            try {
              await changePassword({ currentPassword, newPassword });
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              toast.success("Password changed");
            } catch (err) {
              toast.error(err?.message || "Failed to change password");
            } finally {
              setIsChangingPassword(false);
            }
          }}
          className="space-y-4 max-w-md"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm new password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isChangingPassword}>
              {isChangingPassword ? "Saving..." : "Change password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
