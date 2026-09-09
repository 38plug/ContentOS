import { Link, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircuitBoard,
  LayoutDashboard,
  Menu,
  Mic,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { cashOf, useConsole } from "@/lib/console-store";
import type { Scope } from "@/lib/types";

const nav = [
  { href: "/", label: "Command", icon: CircuitBoard, match: (p: string) => p === "/" },
  { href: "/crew", label: "Crew", icon: Users, match: (p: string) => p.startsWith("/crew") },
  { href: "/voice", label: "Voice", icon: Mic, match: (p: string) => p.startsWith("/voice") },
  {
    href: "/hireflow",
    label: "HireFlow",
    icon: BriefcaseBusiness,
    match: (p: string) => p.startsWith("/hireflow"),
  },
  { href: "/qrrupt", label: "Qrrupt", icon: Wallet, match: (p: string) => p.startsWith("/qrrupt") },
  {
    href: "/qrrupt/calendar",
    label: "Calendar",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/qrrupt/calendar"),
  },
];

export function Shell({
  children,
  scope = "atlas",
  title,
  eyebrow,
  action,
}: {
  children: React.ReactNode;
  scope?: Scope;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const finance = useConsole((s) => s.finance);
  const jobs = useConsole((s) => s.jobs);
  const cash = cashOf(finance);
  const activeJobs = jobs.filter((j) => j.status === "Active").length;

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <div className="min-h-dvh flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-surface">
        <Brand cash={cash} jobs={activeJobs} />
        <Nav pathname={pathname} />
        <p className="mt-auto px-5 py-4 text-xs text-muted">Isolation on · HireFlow ≠ Qrrupt</p>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-bg/80" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 bg-surface border-r border-line flex flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-semibold">ATLAS</span>
              <button className="size-11 grid place-items-center" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <Nav pathname={pathname} onClick={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-end justify-between gap-3 px-4 sm:px-8 pt-5 pb-4 border-b border-line">
          <div className="flex items-start gap-3 min-w-0">
            <button
              className="md:hidden size-11 grid place-items-center rounded-md border border-line bg-elevated"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-accent">
                {eyebrow ?? (scope === "hireflow" ? "HireFlow" : scope === "qrrupt" ? "Qrrupt Inc." : "ATLAS")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-fg mt-1">{title}</h1>
            </div>
          </div>
          <div className="shrink-0">{action}</div>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}

function Brand({ cash, jobs }: { cash: number; jobs: number }) {
  return (
    <div className="px-5 py-5 border-b border-line">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="size-9 grid place-items-center rounded-md bg-accent-dim text-accent">
          <LayoutDashboard className="size-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">
          ATLAS<span className="text-accent">.</span>
        </span>
      </Link>
      <p className="mt-3 font-mono text-[11px] text-muted tabular-nums">
        QR {cash < 0 ? "−" : ""}${Math.abs(cash)} · HF {jobs} jobs
      </p>
    </div>
  );
}

function Nav({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 min-h-11 rounded-md text-sm font-medium",
              active ? "bg-accent-dim text-accent" : "text-muted hover:text-fg hover:bg-elevated",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
