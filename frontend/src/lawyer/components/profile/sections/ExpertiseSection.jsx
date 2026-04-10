import React from "react";
import { Briefcase, Pencil } from "lucide-react";
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
import LanguageManager from "./expertise/LanguageManager";
import PracticeAreaManager from "./expertise/PracticeAreaManager";
import WorkHistoryManager from "./expertise/WorkHistoryManager";

export default function ExpertiseSection({
  form,
  isEditing,
  isSaving,
  onChange,
  onSave,
  setIsEditing,
  onRetry,
  LANGUAGE_OPTIONS,
}) {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/80 transition-all duration-500 ease-in-out border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-blue-600">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Expertise & Experience</CardTitle>
              <CardDescription>
                Showcase your skills, specializations, and professional journey.
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
        {/* 1. Languages Section */}
        <LanguageManager 
          form={form}
          isEditing={isEditing}
          onChange={onChange}
          LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
        />

        <Separator />

        {/* 2. Practice Areas Section */}
        <PracticeAreaManager 
          form={form}
          isEditing={isEditing}
          onChange={onChange}
        />

        <Separator />

        {/* 3. Work History Section */}
        <WorkHistoryManager 
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
              onClick={() => onSave("skills")}
            >
              {isSaving ? "Saving Changes..." : "Save All to Profile"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
