import { useState } from "react";

import { loginUser, registerUser } from "@/api/services/authService";

import SignInForm from "@/public/auth/SignInForm.jsx";
import SignUpForm from "@/public/auth/SignUpForm.jsx";
import { useAuth } from "@/context/auth/useAuth";

export default function AuthPage() {
  const { setToken } = useAuth();
  const [mode, setMode] = useState("signin");
  const isSignUp = mode === "signup";

  const [signInValues, setSignInValues] = useState({
    email: "",
    password: "",
  });

  const [signUpValues, setSignUpValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const title = isSignUp ? "Get Started" : "Welcome back";
  const subtitle = isSignUp
    ? "Create your LawRoute account"
    : "Sign in to continue";

  async function submitSignIn(values) {
    setError("");
    setBusy(true);

    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response?.data?.token) {
        setToken(response.data.token);
      }
    } catch (err) {
      setError(err?.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitSignUp(values) {
    setError("");
    setBusy(true);

    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      };

      const response = await registerUser(payload);

      if (response?.data?.token) {
        setToken(response.data.token);
      }
    } catch (err) {
      setError(err?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full items-stretch">
        <div className="relative w-full overflow-hidden bg-background">
          <div className="hidden h-full lg:block">
            <div
              className={
                "absolute inset-y-0 left-0 w-1/2 transition-transform duration-500 ease-in-out " +
                (isSignUp ? "translate-x-full" : "translate-x-0")
              }
            >
              <div className="flex h-full items-center justify-center p-10">
                <div className="w-full max-w-sm">
                  <div className="mb-8 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      LawRoute
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {title}
                    </h1>
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  </div>

                  {!isSignUp ? (
                    <SignInForm
                      idPrefix="signin"
                      values={signInValues}
                      onChange={setSignInValues}
                      onSubmit={submitSignIn}
                      onSwitchToSignUp={() => {
                        setError("");
                        setMode("signup");
                      }}
                      busy={busy}
                      error={error}
                    />
                  ) : (
                    <SignUpForm
                      idPrefix="signup"
                      values={signUpValues}
                      onChange={setSignUpValues}
                      onSubmit={submitSignUp}
                      onSwitchToSignIn={() => {
                        setError("");
                        setMode("signin");
                      }}
                      busy={busy}
                      error={error}
                    />
                  )}
                </div>
              </div>
            </div>

            <div
              className={
                "absolute inset-y-0 left-1/2 w-1/2 transition-transform duration-500 ease-in-out " +
                (isSignUp ? "-translate-x-full" : "translate-x-0")
              }
            >
              <div className="relative flex h-full items-center justify-center overflow-hidden bg-primary p-10 text-primary-foreground">
                <div className="absolute inset-0 bg-linear-to-br from-primary to-primary/70" />
                <div className="relative w-full max-w-md space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-semibold tracking-tight">
                      Enter the future
                      <br />
                      of legal support,
                      <br />
                      today
                    </h2>
                    <p className="text-sm text-primary-foreground/80">
                      Find the right help, track your progress, and stay
                      informed — all in one place.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Built for</div>
                      <div className="text-3xl font-semibold">
                        Citizens & Lawyers
                      </div>
                      <div className="text-sm text-primary-foreground/80">
                        Get started in minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="grid gap-6 p-6 sm:p-10">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  LawRoute
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>

              {!isSignUp ? (
                <SignInForm
                  idPrefix="m-signin"
                  values={signInValues}
                  onChange={setSignInValues}
                  onSubmit={submitSignIn}
                  onSwitchToSignUp={() => {
                    setError("");
                    setMode("signup");
                  }}
                  busy={busy}
                  error={error}
                />
              ) : (
                <SignUpForm
                  idPrefix="m-signup"
                  values={signUpValues}
                  onChange={setSignUpValues}
                  onSubmit={submitSignUp}
                  onSwitchToSignIn={() => {
                    setError("");
                    setMode("signin");
                  }}
                  busy={busy}
                  error={error}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
