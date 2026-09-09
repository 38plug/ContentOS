import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { RecordForm } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/tasks")({ component: Page });

function Page() {
  const tasksAll = useConsole((s) => s.tasks);
  const tasks = tasksAll.filter((t) => t.company === "hireflow");
  const addTask = useConsole((s) => s.addTask);
  const setTaskStatus = useConsole((s) => s.setTaskStatus);
  return (
    <Shell scope="hireflow" title="Tasks" eyebrow="HireFlow">
      <HfSubnav />
      <RecordForm
        placeholder="Add HireFlow task…"
        onAdd={(title) => addTask({ title, assignee: "Plug", status: "todo", company: "hireflow" })}
      />
      <div className="rounded-lg border border-line bg-surface">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-4 border-b border-line last:border-0">
            <div className="flex-1">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs text-muted mt-1">
                {t.assignee} · {t.status}
              </div>
            </div>
            {t.status !== "done" ? (
              <button className="min-h-11 px-3 text-xs border border-line rounded-md" onClick={() => setTaskStatus(t.id, "done")}>
                Done
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </Shell>
  );
}
