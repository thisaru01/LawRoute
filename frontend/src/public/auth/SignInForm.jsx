import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SignInForm({
  idPrefix,
  values,
  onChange,
  onSubmit,
  onSwitchToSignUp,
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
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor={`${idPrefix}-password`}>Password</FieldLabel>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </button>
          </div>
          <Input
            id={`${idPrefix}-password`}
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => onChange({ ...values, password: e.target.value })}
            required
          />
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
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </Field>

        <Field>
          <FieldDescription>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={onSwitchToSignUp}
            >
              Sign up
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
