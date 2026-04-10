import React from "react";
import { GraduationCap, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Modular Managers
import EducationManager from "./qualifications/EducationManager";
import CertificationManager from "./qualifications/CertificationManager";

export default function QualificationsSection({
  form,
  isEditing,
  isSaving,
  onChange,
  onSave,
  setIsEditing,
  onRetry,
}) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-blue-600">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Education & Credentials</CardTitle>
              <CardDescription>
                Your academic background and professional certifications.
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 border-gray-200 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-1.5 text-gray-700" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* 1. Education Section */}
        <EducationManager 
          form={form}
          isEditing={isEditing}
          onChange={onChange}
        />

        <Separator />

        {/* 2. Licenses & Certifications Section */}
        <CertificationManager 
          form={form}
          isEditing={isEditing}
          onChange={onChange}
        />

        {isEditing && (
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                onRetry && onRetry();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSaving}
              onClick={() => onSave("qualifications")}
            >
              {isSaving ? "Saving Changes..." : "Save All to Profile"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
