import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getMyProfile, updateDisplayName } from "@/lib/game.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthSearch = { redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect:
      typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Inkling" },
      {
        name: "description",
        content:
          "Sign in to Inkling to play the daily word puzzle, keep your streak, and compete on the leaderboard.",
      },
      { property: "og:title", content: "Sign in · Inkling" },
      {
        property: "og:description",
        content:
          "Sign in to Inkling to play the daily word puzzle, keep your streak, and compete on the leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeTarget(redirect: string | undefined): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/play";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safeTarget(redirect);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [view, setView] = useState<"form" | "forgot">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ href: target });
  }, [loading, user, target, navigate]);

  const handleSignIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ href: target });
  };

  const handleSignUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName || undefined },
        emailRedirectTo: window.location.origin,
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setConfirmSent(true);
      return;
    }
    navigate({ href: target });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ href: target });
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email for the reset link");
    setView("form");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    if (mode === "signin") void handleSignIn();
    else void handleSignUp();
  };

  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-3xl font-extrabold tracking-tight">
            Inkling<span className="text-primary">.</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "forgot"
              ? "We'll email you a reset link."
              : mode === "signin"
                ? "Welcome back — your streak is waiting."
                : "Create an account to start your streak."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {confirmSent ? (
            <div className="text-center">
              <h2 className="font-display text-lg font-bold">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it
                to activate your account, then sign in.
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setConfirmSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : view === "forgot" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleForgot();
              }}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setView("form")}
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-md bg-secondary p-1 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={
                    mode === "signin"
                      ? "rounded-sm bg-card px-3 py-1.5 shadow-sm"
                      : "rounded-sm px-3 py-1.5 text-muted-foreground"
                  }
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={
                    mode === "signup"
                      ? "rounded-sm bg-card px-3 py-1.5 shadow-sm"
                      : "rounded-sm px-3 py-1.5 text-muted-foreground"
                  }
                >
                  Create account
                </button>
              </div>

              <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                {mode === "signup" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Player name</Label>
                    <Input
                      id="name"
                      value={displayName}
                      maxLength={30}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Shown on the leaderboard"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
                <Button type="submit" disabled={busy}>
                  {busy
                    ? "One moment…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </Button>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setView("forgot")}
                  >
                    Forgot your password?
                  </button>
                )}
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void handleGoogle()}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-foreground"
            onClick={() => navigate({ href: "/" })}
          >
            ← Back to home
          </button>
        </p>
      </div>
    </div>
  );
}
