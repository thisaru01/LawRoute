import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const loadingCard = (
  <Card className="mt-6">
    <CardHeader>
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-4 w-40" />
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-24 w-full md:col-span-2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default function LawyerProfileDetails({
  form,
  isLoading,
  isSaving,
  error,
  success,
  profileCompleted,
  onRetry,
  onChange,
  onSubmit,
}) {
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Profile Details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading lawyer profile...
        </p>
        {loadingCard}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn’t load profile</CardTitle>
          <CardDescription className="text-destructive">
            {error?.message || "Request failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile Details</h1>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Manage your public lawyer information.
          </p>
          <Badge
            className={
              profileCompleted
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {profileCompleted ? "Completed" : "Incomplete"}
          </Badge>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>
              These details are shown when clients browse lawyers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="professionalTitle">
                Professional title
              </FieldLabel>
              <Input
                id="professionalTitle"
                value={form.professionalTitle}
                onChange={onChange("professionalTitle")}
                placeholder="Attorney at Law"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="totalYearsExperience">
                Total years of experience
              </FieldLabel>
              <Input
                id="totalYearsExperience"
                type="number"
                min="0"
                value={form.totalYearsExperience}
                onChange={onChange("totalYearsExperience")}
                placeholder="5"
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <textarea
                id="bio"
                className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form.bio}
                onChange={onChange("bio")}
                placeholder="Write a short summary about your legal background and strengths."
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="languages">Languages</FieldLabel>
              <Input
                id="languages"
                value={form.languages}
                onChange={onChange("languages")}
                placeholder="English, Sinhala"
              />
              <FieldDescription>Comma-separated values.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="practiceAreas">Practice areas</FieldLabel>
              <Input
                id="practiceAreas"
                value={form.practiceAreas}
                onChange={onChange("practiceAreas")}
                placeholder="Civil, Family, Labour"
              />
              <FieldDescription>Comma-separated values.</FieldDescription>
            </Field>

            <Field className="md:col-span-2" orientation="horizontal">
              <div className="space-y-1">
                <FieldLabel htmlFor="isFree">Free consultation</FieldLabel>
                <FieldDescription>
                  Enable if you accept free initial consultations.
                </FieldDescription>
              </div>
              <input
                id="isFree"
                type="checkbox"
                checked={form.isFree}
                onChange={onChange("isFree")}
                className="h-4 w-4 rounded border-input"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact and Qualification</CardTitle>
            <CardDescription>
              Keep your contact details and credentials up to date.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="+94 77 123 4567"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                value={form.location}
                onChange={onChange("location")}
                placeholder="Colombo"
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="officeAddress">Office address</FieldLabel>
              <Input
                id="officeAddress"
                value={form.officeAddress}
                onChange={onChange("officeAddress")}
                placeholder="No. 10, Example Street, Colombo"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="barRegistrationNumber">
                Bar registration number
              </FieldLabel>
              <Input
                id="barRegistrationNumber"
                value={form.barRegistrationNumber}
                onChange={onChange("barRegistrationNumber")}
                placeholder="BRN-2020-0001"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="memberships">Memberships</FieldLabel>
              <Input
                id="memberships"
                value={form.memberships}
                onChange={onChange("memberships")}
                placeholder="Bar Association, IBA"
              />
              <FieldDescription>Comma-separated values.</FieldDescription>
            </Field>
          </CardContent>
        </Card>

        {success ? <p className="text-sm text-green-700">{success}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
