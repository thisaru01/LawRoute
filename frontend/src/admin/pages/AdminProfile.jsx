import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { updateMe, updateProfilePhoto } from "@/api/services/userService";
import { toast } from "sonner";
import ConfirmDialog from "@/components/consultation-requests/ConfirmDialog";

export default function AdminProfile() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  const initials = useMemo(() => {
    const displayName = user?.name || "User";
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  const displayPhoto = previewUrl || user?.profilePhoto || "";

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

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!user || !file) return;

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
  }

  async function handleUploadPhoto() {
    if (!user || !selectedFile) return;

    setIsUploadingPhoto(true);
    try {
      const response = await updateProfilePhoto(selectedFile);
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleCancelPhoto() {
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to revoke object URL", err);
      }
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }

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
          View and manage your admin account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)] lg:grid-cols-[auto,minmax(0,2fr)]">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Basic information about your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={displayPhoto} alt={user.name} />
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile photo</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isUploadingPhoto}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG or JPEG. Max 5MB.
              </p>

              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleUploadPhoto}
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? "Uploading..." : "Save photo"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelPhoto}>
                    Cancel
                  </Button>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Update your name. Your email is read-only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-md">
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
                        isSavingName || !name || name.trim() === "" || name.trim() === user.name
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
      </div>
    </div>
  );
}
