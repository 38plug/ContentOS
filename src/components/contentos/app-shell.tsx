import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Clapperboard, Film, LayoutGrid, Library, LogOut, Scissors } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";

const NAV: Array<{
  to: "/" | "/library" | "/queue" | "/clip" | "/clips";
  label: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
}> = [
  { to: "/", label: "Studio", icon: LayoutGrid, exact: true },
  { to: "/library", label: "Library", icon: Library },
  { to: "/queue", label: "Queue", icon: CalendarDays },
  { to: "/clip", label: "Clip", icon: Scissors },
  { to: "/clips", label: "Exports", icon: Film },
];

export function AppShell({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  const user = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [signingOut, setSigningOut] = useState(false);
  const initials = (user?.displayName ?? user?.primaryEmail ?? "C").slice(0, 1).toUpperCase();

  return (
    <div className="cos-app">
      <aside className="cos-rail">
        <Link to="/" className="cos-brand">
          <span className="cos-brand-mark">
            <Clapperboard size={18} strokeWidth={2.25} />
          </span>
          <span className="cos-brand-text">
            Content<span>OS</span>
          </span>
        </Link>
        <nav className="cos-nav">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={cn("cos-nav-link", active && "active")}>
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="cos-rail-foot">
          <div className="cos-user">
            <span className="cos-avatar">{initials}</span>
            <div>
              <strong>{user?.displayName ?? "Creator"}</strong>
              <small>{user?.primaryEmail ?? "Personal library"}</small>
            </div>
          </div>
          {authEnabled ? (
            <button
              type="button"
              className="cos-ghost-btn"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut().catch(() => setSigningOut(false));
              }}
            >
              <LogOut size={15} />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : null}
        </div>
      </aside>
      <div className="cos-main">
        <header className="cos-top">
          <div>
            <p className="cos-kicker">ContentOS</p>
            {title ? <h1>{title}</h1> : null}
          </div>
          {action}
        </header>
        <div className="cos-body">{children}</div>
      </div>
      <nav className="cos-mobile-nav">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={cn(active && "active")}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="cos-boot">
        <div className="cos-boot-card">
          <span className="cos-brand-mark lg">
            <Clapperboard size={22} />
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em", margin: 0 }}>
            Content<span style={{ color: "var(--color-lime)" }}>OS</span>
          </h1>
          <p>Loading your editorial studio…</p>
          <p style={{ fontSize: "0.8rem", maxWidth: 320, textAlign: "center" }}>
            Preparing the content library, clipping suite, and growth copy workspace.
          </p>
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <>{children}</>;
}
