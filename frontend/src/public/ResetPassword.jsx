import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPassword as apiResetPassword } from "@/api/services/authService";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      // nothing to do, but user may have landed here incorrectly
    }
  }, [token, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token || !email) {
      toast.error("Missing reset token or email");
      return;
    }

    setBusy(true);
    try {
      await apiResetPassword({ token, email, password });
      toast.success("Password reset. Please sign in.");
      navigate("/auth", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-6">
        <h1 className="text-lg font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter a new password for <strong>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving..." : "Reset password"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/auth")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
