import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContactSection({
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl">Contact Details</CardTitle>
              <CardDescription>
                How clients can reach you and where you work from.
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
              <svg
                className="w-4 h-4 mr-1.5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          {isEditing ? (
            <Input
              id="phone"
              value={form.phone}
              onChange={onChange("phone")}
              placeholder="+94 77 123 4567"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.phone || "—"}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          {isEditing ? (
            <Input
              id="location"
              value={form.location}
              onChange={onChange("location")}
              placeholder="Colombo"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.location || "—"}
            </div>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="officeAddress">Office address</FieldLabel>
          {isEditing ? (
            <Input
              id="officeAddress"
              value={form.officeAddress}
              onChange={onChange("officeAddress")}
              placeholder="No. 10, Example Street, Colombo"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.officeAddress || "—"}
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
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSaving}
              onClick={() => onSave("contact")}
            >
              {isSaving ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
