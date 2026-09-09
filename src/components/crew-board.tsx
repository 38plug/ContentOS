import { cn } from "@/lib/cn";
import { useConsole } from "@/lib/console-store";
import type { AgentId } from "@/lib/types";

export function CrewBoard({ compact = false }: { compact?: boolean }) {
  const agents = useConsole((s) => s.agents);
  const assignAgent = useConsole((s) => s.assignAgent);
  const clearAgent = useConsole((s) => s.clearAgent);
  const addTask = useConsole((s) => s.addTask);

  function dispatch(id: AgentId, name: string) {
    const task = window.prompt(`Task for ${name}`);
    if (!task?.trim()) return;
    assignAgent(id, task.trim());
    addTask({
      title: task.trim(),
      assignee: name,
      status: "inprogress",
      company: id.startsWith("hf") ? "hireflow" : id.startsWith("qr") || id === "muse" ? "qrrupt" : "qrrupt",
      description: `Assigned from crew board → ${name}`,
    });
  }

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4")}>
      {agents.map((a) => (
        <article key={a.id} className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-sm">{a.name}</div>
              <div className="text-xs text-muted mt-0.5">{a.title}</div>
            </div>
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full",
                a.status === "working"
                  ? "bg-accent-dim text-accent"
                  : a.status === "blocked"
                    ? "bg-danger/15 text-danger"
                    : "bg-elevated text-muted",
              )}
            >
              {a.status}
            </span>
          </div>
          <p className="text-xs text-muted min-h-8 leading-snug">
            {a.currentTask ?? "Idle"}
          </p>
          <div className="mt-auto flex gap-2">
            <button
              className="flex-1 min-h-11 rounded-md bg-elevated text-xs font-medium border border-line"
              onClick={() => dispatch(a.id, a.name)}
            >
              Assign
            </button>
            {a.status !== "idle" ? (
              <button
                className="min-h-11 px-3 rounded-md text-xs text-muted border border-line"
                onClick={() => clearAgent(a.id)}
              >
                Clear
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
