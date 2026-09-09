import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { HfSubnav } from "@/components/hf-subnav";
import { Metrics } from "@/components/metric";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/")({ component: HireflowHome });

const FUNNEL = ["New Applicant", "Screening", "Interview Scheduled", "Qualified", "Offer", "Placed"] as const;

function HireflowHome() {
  const candidates = useConsole((s) => s.candidates);
  const jobs = useConsole((s) => s.jobs);
  const interviews = useConsole((s) => s.interviews);
  const tasksAll = useConsole((s) => s.tasks);
  const tasks = tasksAll.filter((t) => t.company === "hireflow");
  const max = Math.max(1, ...FUNNEL.map((s) => candidates.filter((c) => c.status === s).length), candidates.length);

  return (
    <Shell
      scope="hireflow"
      title="Recruitment desk"
      eyebrow="HireFlow"
      action={
        <Link
          to="/hireflow/register"
          className="inline-flex items-center gap-2 min-h-11 px-4 rounded-md bg-accent text-bg text-sm font-semibold"
        >
          <Plus className="size-4" /> Add candidate
        </Link>
      }
    >
      <HfSubnav />
      <Metrics
        items={[
          { label: "Candidates", value: String(candidates.length), detail: "live store, not a mock" },
          { label: "Active jobs", value: String(jobs.filter((j) => j.status === "Active").length) },
          { label: "Interviews", value: String(interviews.length) },
          { label: "HF tasks", value: String(tasks.filter((t) => t.status !== "done").length) },
        ]}
      />
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold mb-4">Funnel</h2>
          {FUNNEL.map((label) => {
            const n = candidates.filter((c) => c.status === label).length;
            return (
              <div key={label} className="flex items-center gap-3 text-xs text-muted my-2">
                <span className="w-28 truncate">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-elevated">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(8, (n / max) * 100)}%` }} />
                </div>
                <b className="text-fg tabular-nums w-6 text-right">{n}</b>
              </div>
            );
          })}
        </section>
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold mb-2">Today’s interviews</h2>
          {interviews.map((i) => (
            <div key={i.id} className="flex items-center gap-3 py-3 border-t border-line first:border-0">
              <b className="w-12 text-sm tabular-nums">{i.time}</b>
              <div className="flex-1">
                <div className="text-sm">{i.candidate}</div>
                <div className="text-xs text-muted">{i.job}</div>
              </div>
              <span className="text-[10px] uppercase text-ok">{i.status}</span>
            </div>
          ))}
        </section>
      </div>
    </Shell>
  );
}
