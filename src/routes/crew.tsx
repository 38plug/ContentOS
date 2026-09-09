import { createFileRoute } from "@tanstack/react-router";
import { CrewBoard } from "@/components/crew-board";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/crew")({ component: CrewPage });

function CrewPage() {
  const tasks = useConsole((s) => s.tasks);
  const setTaskStatus = useConsole((s) => s.setTaskStatus);
  const open = tasks.filter((t) => t.status !== "done");

  return (
    <Shell title="Sub-agents" eyebrow="Crew" scope="atlas">
      <p className="text-sm text-muted mb-5 max-w-2xl">
        JARVIS routes. Specialists execute. HireFlow bots never post to Qrrupt books. Assign a task,
        or mark desk work done below.
      </p>
      <CrewBoard />
      <h2 className="text-sm font-semibold mt-8 mb-3">Open desk work</h2>
      <div className="rounded-lg border border-line bg-surface divide-y divide-line">
        {open.length === 0 ? (
          <p className="p-4 text-sm text-muted">Nothing open.</p>
        ) : (
          open.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-xs text-muted mt-1">
                  {t.company} · {t.assignee} · {t.status}
                </div>
              </div>
              <button
                className="min-h-11 px-3 rounded-md text-xs border border-line"
                onClick={() => setTaskStatus(t.id, "done")}
              >
                Done
              </button>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
