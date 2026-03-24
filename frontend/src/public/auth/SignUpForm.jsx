import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ROLE_OPTIONS = [
  { value: "user", label: "Citizen" },
  { value: "lawyer", label: "Lawyer" },
];

export default function SignUpForm({
  idPrefix,
  values,
  onChange,
  onSubmit,
  onSwitchToSignIn,
  busy,
  error,
}) {
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
          <Input
            id={`${idPrefix}-name`}
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-email`}>Email</FieldLabel>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-password`}>Password</FieldLabel>
          <Input
            id={`${idPrefix}-password`}
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => onChange({ ...values, password: e.target.value })}
            required
            minLength={8}
          />
          <FieldDescription>
            8+ chars, include letter, number, special.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Role</FieldLabel>
          <RadioGroup
            value={values.role}
            onValueChange={(role) => onChange({ ...values, role })}
            className="grid gap-2"
          >
            {ROLE_OPTIONS.map((opt) => {
              const id = `${idPrefix}-role-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={id} />
                  <Label htmlFor={id}>{opt.label}</Label>
                </div>
              );
            })}
          </RadioGroup>
        </Field>

        {error ? (
          <Field>
            <FieldDescription className="text-destructive">
              {error}
            </FieldDescription>
          </Field>
        ) : null}

        <Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account..." : "Sign up"}
          </Button>
        </Field>

        <Field>
          <FieldDescription>
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={onSwitchToSignIn}
            >
              Log in
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
