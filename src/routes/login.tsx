import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";
import { useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("creator@contentos.dev");
  const [password, setPassword] = useState("contentos-demo");
  const [name, setName] = useState("Studio Creator");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authEnabled) return <Navigate to="/" />;
  if (!isPending && user) return <Navigate to="/" />;

  async function onEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (err) throw new Error(err.message ?? "Sign-up failed");
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
        });
        if (err) throw new Error(err.message ?? "Sign-in failed");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
      setBusy(false);
    }
  }

  return (
    <div className="cos-login">
      <div className="cos-login-card">
        <span className="cos-brand-mark lg">
          <Clapperboard size={22} />
        </span>
        <h1>
          Content<span style={{ color: "var(--color-lime)" }}>OS</span>
        </h1>
        <p className="lead">
          Track posts across platforms, detect viral moments on YouTube, and export Shorts-ready
          packages with SEO copy.
        </p>

        <form className="stack" onSubmit={onEmailAuth}>
          {mode === "signup" ? (
            <div className="cos-field">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          ) : null}
          <div className="cos-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="cos-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {error ? <p className="cos-error">{error}</p> : null}
          <button className="cos-btn" type="submit" disabled={busy}>
            {busy ? "Working…" : mode === "signup" ? "Create studio account" : "Enter studio"}
          </button>
          <button
            type="button"
            className="cos-btn ghost"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>

        <div className="cos-divider">or</div>
        <div className="stack">
          {GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              className="cos-btn secondary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError(null);
                void signIn(p.providerId).catch((err) => {
                  setError(err instanceof Error ? err.message : "Sign-in failed");
                  setBusy(false);
                });
              }}
            >
              Continue with {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
