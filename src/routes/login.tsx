import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";
import { useState } from "react";
import {
  authClient,
  authEnabled,
  getAvailableOAuthProviders,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

type DemoIdentity = { email: string; password: string; name: string };

function mintDemoIdentity(): DemoIdentity {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : `${Date.now().toString(36)}`;
  return {
    email: `creator-${id}@contentos.local`,
    password: `cos-${id}-${Math.random().toString(36).slice(2, 10)}`,
    name: "Studio Creator",
  };
}

/** Per-browser identity so demo entry never shares one global account. */
function getOrCreateDemoIdentity(): DemoIdentity {
  if (typeof window === "undefined") return mintDemoIdentity();
  const key = "contentos.demo-identity.v1";
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoIdentity;
      if (parsed?.email && parsed?.password && parsed?.name) return parsed;
    }
  } catch {
    /* ignore */
  }
  const next = mintDemoIdentity();
  try {
    window.sessionStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Studio Creator");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oauthProviders = getAvailableOAuthProviders();

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
          : "Could not enter the studio. Create an account or try Open a private studio.",
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
          onClick={() => {
            const demo = getOrCreateDemoIdentity();
            void enterWithEmail({
              email: demo.email,
              password: demo.password,
              name: demo.name,
              preferSignUp: true,
            });
          }}
        >
          {busy ? "Opening studio…" : "Open a private studio"}
        </button>
        <p className="sub" style={{ margin: "0 0 18px", textAlign: "center" }}>
          Creates a unique account in this browser and seeds sample posts and clips for you alone.
        </p>

        <div className="cos-divider">or use your email</div>

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
              placeholder="you@example.com"
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

        {oauthProviders.length > 0 ? (
          <>
            <div className="cos-divider">or</div>
            <div className="stack">
              {oauthProviders.map((p) => (
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
                          ? `${err.message} — use email or Open a private studio if OAuth isn’t available here.`
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
          </>
        ) : (
          <p className="sub" style={{ marginTop: 18, textAlign: "center" }}>
            Use email or Open a private studio — Google / X sign-in isn’t available on
            this published host yet.
          </p>
        )}
      </div>
    </div>
  );
}
