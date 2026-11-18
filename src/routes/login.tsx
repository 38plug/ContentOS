import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";
import { useState } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

const DEMO_EMAIL = "demo@contentos.dev";
const DEMO_PASSWORD = "contentos-demo";
const DEMO_NAME = "Demo Creator";

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [name, setName] = useState(DEMO_NAME);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authEnabled) return <Navigate to="/" />;
  if (!isPending && user) return <Navigate to="/" />;

  async function enterWithEmail(opts: {
    email: string;
    password: string;
    name: string;
    preferSignUp: boolean;
  }) {
    setBusy(true);
    setError(null);
    try {
      const attemptSignIn = async () => {
        const { error: err } = await authClient.signIn.email({
          email: opts.email,
          password: opts.password,
        });
        if (err) throw new Error(err.message ?? "Sign-in failed");
      };
      const attemptSignUp = async () => {
        const { error: err } = await authClient.signUp.email({
          email: opts.email,
          password: opts.password,
          name: opts.name,
        });
        if (err) throw new Error(err.message ?? "Sign-up failed");
      };

      if (opts.preferSignUp) {
        try {
          await attemptSignUp();
        } catch {
          await attemptSignIn();
        }
      } else {
        try {
          await attemptSignIn();
        } catch {
          await attemptSignUp();
        }
      }
      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not enter the studio. Try Create account, or use Enter demo studio.",
      );
      setBusy(false);
    }
  }

  async function onEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    await enterWithEmail({
      email,
      password,
      name,
      preferSignUp: mode === "signup",
    });
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

        <button
          type="button"
          className="cos-btn"
          style={{ width: "100%", marginBottom: 14 }}
          disabled={busy}
          onClick={() =>
            void enterWithEmail({
              email: DEMO_EMAIL,
              password: DEMO_PASSWORD,
              name: DEMO_NAME,
              preferSignUp: true,
            })
          }
        >
          {busy ? "Opening studio…" : "Enter demo studio"}
        </button>
        <p className="sub" style={{ margin: "0 0 18px", textAlign: "center" }}>
          One click — creates a personal demo account if needed, then opens Studio with sample posts
          and clips.
        </p>

        <div className="cos-divider">or use email</div>

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
          <button className="cos-btn secondary" type="submit" disabled={busy}>
            {busy ? "Working…" : mode === "signup" ? "Create studio account" : "Sign in"}
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
                  setError(
                    err instanceof Error
                      ? `${err.message} — use Enter demo studio if OAuth is blocked here.`
                      : "Sign-in failed",
                  );
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
