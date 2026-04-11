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
  const phoneVal = (form.phone || "").trim();
  const phoneError =
    isEditing && phoneVal !== ""
      ? !/^(?:\+94|0)?7[0-9]{8}$/.test(phoneVal.replace(/\s+/g, ""))
        ? "Invalid Sri Lankan phone number format (e.g., 0771234567 or +94771234567)."
        : null
      : null;

  const locationVal = (form.location || "").trim();
  const locationError =
    isEditing && form.location !== undefined && locationVal === ""
      ? "Location is required."
      : null;

  const addressVal = (form.officeAddress || "").trim();
  const addressError =
    isEditing && form.officeAddress !== undefined && addressVal !== "" && addressVal.length < 10
      ? "Office address is too short. Please provide a more detailed address."
      : null;

  const hasValidationError = !!phoneError || !!locationError || !!addressError;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200/80 transition-all duration-500 ease-in-out border-gray-200/60">
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
            <div className="space-y-1">
              <Input
                id="phone"
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="077 123 4567"
                className={phoneError ? "border-red-400 focus-visible:ring-red-200" : ""}
              />
              {phoneError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {phoneError}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.phone || "—"}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location <span className="text-red-600 font-bold text-lg">*</span></FieldLabel>
          {isEditing ? (
            <div className="space-y-1">
              <Input
                id="location"
                value={form.location}
                onChange={onChange("location")}
                placeholder="Colombo"
                className={locationError ? "border-red-400 focus-visible:ring-red-200" : ""}
              />
              {locationError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {locationError}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {form.location || "—"}
            </div>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="officeAddress">Office address <span className="text-red-600 font-bold text-lg">*</span></FieldLabel>
          {isEditing ? (
            <div className="space-y-1">
              <Input
                id="officeAddress"
                value={form.officeAddress}
                onChange={onChange("officeAddress")}
                placeholder="No. 10, Example Street, Colombo"
                className={addressError ? "border-red-400 focus-visible:ring-red-200" : ""}
              />
              {addressError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {addressError}
                </p>
              )}
            </div>
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
              disabled={isSaving || hasValidationError}
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
