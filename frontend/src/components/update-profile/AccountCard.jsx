import { useState } from "react";

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
import { updateProfilePhoto } from "@/api/services/userService";
import { toast } from "sonner";

export default function AccountCard() {
  const { user, setUser } = useAuth();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!user) return null;

  const initials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const displayPhoto = previewUrl || user?.profilePhoto || "";

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
        console.warn("Failed to revoke object URL", err);
      }
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Basic information about your account.</CardDescription>
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
  );
}
