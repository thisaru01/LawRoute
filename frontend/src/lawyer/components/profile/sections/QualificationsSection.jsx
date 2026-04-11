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
    <Card className="group overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-200/80 transition-all duration-500 ease-in-out border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 shadow-sm text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30">
              <GraduationCap className="w-6 h-6 text-emerald-600 fill-emerald-200/30" />
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
