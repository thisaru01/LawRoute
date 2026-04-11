import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { forgotPassword } from "@/api/services/authService";
import { toast } from "sonner";

export default function SignInForm({
  idPrefix,
  values,
  onChange,
  onSubmit,
  onSwitchToSignUp,
  busy,
  error,
}) {
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSendForgot() {
    if (!forgotEmail) return toast.error("Please enter an email");
    setIsSending(true);
    try {
      await forgotPassword({ email: forgotEmail });
      toast.success("If that email exists, a reset link was sent");
      setIsForgotOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to send reset email");
    } finally {
      setIsSending(false);
    }
  }
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
            <AlertDialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
              <div>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setForgotEmail(values.email || "")}
                  >
                    Forgot?
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Forgot password</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter the email for your account and we'll send a reset
                      link.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="pt-2">
                    <Input
                      id={`${idPrefix}-forgot-email`}
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendForgot}>
                      {isSending ? "Sending..." : "Send reset email"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </div>
            </AlertDialog>
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
