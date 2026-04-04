import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const EXPERTISE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "commercial", label: "Commercial" },
  { value: "corporate", label: "Corporate" },
  { value: "family", label: "Family" },
  { value: "land", label: "Land" },
  { value: "labour", label: "Labour" },
  { value: "tax", label: "Tax" },
  { value: "constitutional", label: "Constitutional" },
  { value: "administrative", label: "Administrative" },
  { value: "environmental", label: "Environmental" },
  { value: "intellectual_property", label: "Intellectual Property" },
];

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
  profile,
  form,
  isLoading,
  savingSection,
  error,
  success,
  profileCompleted,
  onRetry,
  onChange,
  onSaveSection,
}) {
  const user = profile?.user || {};
  const displayName = user.name || "Lawyer";
  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Lawyer";
  const headline =
    form.professionalTitle?.trim() ||
    profile?.basicInfo?.professionalTitle?.trim() ||
    profile?.basicInfo?.bio?.trim()?.split("\n")[0] ||
    "Add a short professional headline to make your profile stand out.";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const isSectionSaving = (section) => savingSection === section;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile Details</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading lawyer profile...
          </p>
        </div>
        {loadingCard}
      </div>
    );
  }

  if (!profile && error) {
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
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="size-16 border border-border">
              <AvatarImage src={user.profilePhoto || ""} alt={displayName} />
              <AvatarFallback className="text-base font-semibold">
                {initials || "L"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{roleLabel}</span>
                  <span>•</span>
                  <span>Own Profile</span>
                </div>
              </div>

              <p className="max-w-2xl text-sm text-muted-foreground">{headline}</p>
            </div>
          </div>
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

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  Your professional identity and summary.
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
                    className="min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={form.bio}
                    onChange={onChange("bio")}
                    placeholder="Write a short summary about your legal background and strengths."
                  />
                </Field>

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    disabled={isSectionSaving("about")}
                    onClick={() => onSaveSection("about")}
                  >
                    {isSectionSaving("about") ? "Saving..." : "Save About"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills and Practice</CardTitle>
                <CardDescription>
                  Add your legal expertise and client-facing capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="expertise">Expertise</FieldLabel>
                  <Select value={form.expertise} onValueChange={(value) => onChange("expertise")({ target: { value } })}>
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

                <Field className="md:col-span-2">
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

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    disabled={isSectionSaving("skills")}
                    onClick={() => onSaveSection("skills")}
                  >
                    {isSectionSaving("skills") ? "Saving..." : "Save Skills"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>
                  How clients can reach you and where you work from.
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

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    disabled={isSectionSaving("contact")}
                    onClick={() => onSaveSection("contact")}
                  >
                    {isSectionSaving("contact") ? "Saving..." : "Save Contact"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
                <CardDescription>
                  Record credentials that support your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
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

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    disabled={isSectionSaving("qualifications")}
                    onClick={() => onSaveSection("qualifications")}
                  >
                    {isSectionSaving("qualifications")
                      ? "Saving..."
                      : "Save Qualifications"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {error ? (
              <p className="text-sm text-destructive">
                {error?.message || "Request failed"}
              </p>
            ) : null}

            {success ? <p className="text-sm text-green-700">{success}</p> : null}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Profile snapshot</CardTitle>
                <CardDescription>
                  You are editing your own lawyer account profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
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

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">4</span>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                  Each section saves independently to your own account via the protected /lawyer-profile/me API.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
