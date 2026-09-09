import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/pipeline")({ component: Page });

const COLS = ["New Applicant", "Screening", "Interview Scheduled", "Qualified", "Offer", "Placed"] as const;

function Page() {
  const candidates = useConsole((s) => s.candidates);
  return (
    <Shell scope="hireflow" title="Pipeline" eyebrow="HireFlow">
      <HfSubnav />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLS.map((col) => {
          const items = candidates.filter((c) => c.status === col);
          return (
            <section key={col} className="min-w-52 flex-1 rounded-lg border border-line bg-surface p-3">
              <h2 className="text-xs uppercase tracking-wider text-muted mb-3">
                {col} · {items.length}
              </h2>
              {items.map((c) => (
                <div key={c.id} className="rounded-md bg-elevated p-3 mb-2">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted mt-1">{c.appliedFor}</div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
