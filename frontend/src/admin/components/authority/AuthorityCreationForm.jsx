import React, { useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants";
import { registerUser } from "@/api/services/authService";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AuthorityCreationForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    managedCategory: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOtherCategory = formData.managedCategory === "other";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, managedCategory: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.managedCategory) {
      setError("All fields are required.");
      return;
    }

    if (isOtherCategory) {
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        ...formData,
        role: "authority",
      });
      toast.success("Authority profile created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        managedCategory: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create authority profile", err);
      const message = err.response?.data?.message || err.message || "Failed to create authority profile.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Authority official name"
            required
            disabled={isOtherCategory}
          />
        </Field>

        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="authority@lawroute.gov"
            required
            disabled={isOtherCategory}
          />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            required
            disabled={isOtherCategory}
          />
        </Field>

        <Field>
          <FieldLabel>Managed Category</FieldLabel>
          <Select
            value={formData.managedCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category to manage" />
            </SelectTrigger>
            <SelectContent>
              {CIVIL_ISSUE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      {isOtherCategory && (
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-blue-900">System Managed Category</h4>
            <p className="text-xs text-blue-700 leading-normal">
              Note: The 'Other' category is permanently managed by the System Administrator. 
              Standard authority profiles do not cover this area.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading || isOtherCategory}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          "Create Authority Profile"
        )}
      </Button>
    </form>
  );
}
