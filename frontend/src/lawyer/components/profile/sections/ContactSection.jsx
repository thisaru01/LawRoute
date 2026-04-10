import React from "react";
import { Phone, Pencil } from "lucide-react";
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
              <Phone className="w-5 h-5" />
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
              <Pencil className="w-4 h-4 mr-1.5 text-gray-700" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="phone">Phone <span className="text-red-600 font-bold text-lg">*</span></FieldLabel>
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
          <FieldLabel htmlFor="location">Location <span className="text-red-600 font-bold text-lg">*</span></FieldLabel>
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
          <FieldLabel htmlFor="officeAddress">Office address <span className="text-red-600 font-bold text-lg">*</span></FieldLabel>
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
