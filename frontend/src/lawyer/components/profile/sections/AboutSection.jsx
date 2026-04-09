import React from "react";
import { Star, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AboutSection({
  form,
  isEditing,
  isSaving,
  onChange,
  onSave,
  setIsEditing,
  onRetry,
  EXPERTISE_OPTIONS,
  isVerified,
}) {
  return (
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-blue-600">
              <Star className="w-5 h-5 text-amber-500 fill-amber-50" />
            </div>
            <div>
              <CardTitle className="text-xl">About & Identity</CardTitle>
              <CardDescription>
                Your professional identity and profile summary.
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
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          {isEditing ? (
            <Input
              id="name"
              value={form.name}
              onChange={onChange("name")}
              placeholder="Your full name"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.name || "—"}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="professionalTitle">Professional title</FieldLabel>
          {isEditing ? (
            <Input
              id="professionalTitle"
              value={form.professionalTitle}
              onChange={onChange("professionalTitle")}
              placeholder="Attorney at Law"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.professionalTitle || "—"}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="expertise">Expertise</FieldLabel>
          {isEditing ? (
            <Select
              value={form.expertise}
              onValueChange={(value) => onChange("expertise")({ target: { value } })}
            >
              <SelectTrigger className="w-full" id="expertise">
                <SelectValue placeholder="Select expertise" />
              </SelectTrigger>
              <SelectContent>
                {EXPERTISE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">{form.expertise}</div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="barRegistrationNumber">
            Bar registration number
          </FieldLabel>
          {isEditing ? (
            <div className="space-y-1">
              <Input
                id="barRegistrationNumber"
                value={form.barRegistrationNumber}
                onChange={onChange("barRegistrationNumber")}
                placeholder="BRN-2020-0001"
                disabled={isVerified}
                className={isVerified ? "bg-gray-50 text-muted-foreground border-dashed" : ""}
              />
              {isVerified && (
                <FieldDescription className="text-blue-600 flex items-center gap-1">
                   Verified credential. Contact support to change.
                </FieldDescription>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.barRegistrationNumber || "—"}
            </div>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="memberships">Memberships</FieldLabel>
          {isEditing ? (
            <Input
              id="memberships"
              value={form.memberships}
              onChange={onChange("memberships")}
              placeholder="Bar Association, IBA"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.memberships || "—"}
            </div>
          )}
          {isEditing ? (
            <FieldDescription>Comma-separated values.</FieldDescription>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="totalYearsExperience">
            Total years of experience
          </FieldLabel>
          {isEditing ? (
            <Input
              id="totalYearsExperience"
              type="number"
              min="0"
              value={form.totalYearsExperience}
              onChange={onChange("totalYearsExperience")}
              placeholder="5"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.totalYearsExperience || "—"}
            </div>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          {isEditing ? (
            <textarea
              id="bio"
              className="min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.bio}
              onChange={onChange("bio")}
              placeholder="Write a short summary about your legal background and strengths."
            />
          ) : (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {form.bio || "—"}
            </div>
          )}
        </Field>

        {isEditing ? (
          <div className="md:col-span-2 p-6 bg-gray-50 border-t -mx-6 -mb-6 flex justify-end gap-2">
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
            <Button type="button" className="bg-black text-white hover:bg-gray-800" disabled={isSaving} onClick={() => onSave("about")}>
              {isSaving ? "Saving..." : "Save About"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
