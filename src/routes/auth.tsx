import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Kgaswane Learning Assistant" },
      {
        name: "description",
        content:
          "Sign in to generate lesson plans, parent messages and meeting summaries, and to save your work.",
      },
      { property: "og:title", content: "Sign in — Kgaswane Learning Assistant" },
      {
        property: "og:description",
        content: "Create a free account to generate and save your teaching work.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        toast.success("Welcome!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again or use your email address.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <img src={logo} alt="" width={40} height={40} className="size-10" />
          <span className="font-display text-lg font-semibold">Kgaswane Learning Assistant</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {checkEmail ? "Check your email" : mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {checkEmail
                ? `We sent a confirmation link to ${email}. Click it to finish creating your account.`
                : "Your account keeps your saved lesson plans, messages and chats private to you."}
            </CardDescription>
          </CardHeader>
          {!checkEmail && (
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={onGoogle} disabled={busy}>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <form className="space-y-4" onSubmit={onSubmit}>
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Itumeleng"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here? " : "Already have an account? "}
                <button
                  type="button"
                  className="font-medium text-primary underline"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </CardContent>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can browse the tools, sample outputs and prompt library without an account.
        </p>
      </div>
    </div>
  );
}
