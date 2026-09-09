import { createFileRoute } from "@tanstack/react-router";
import { RecordForm } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";
import { QrSubnav } from "@/components/qr-subnav";

export const Route = createFileRoute("/qrrupt/tasks")({ component: Page });

function Page() {
  const tasksAll = useConsole((s) => s.tasks);
  const tasks = tasksAll.filter((t) => t.company === "qrrupt");
  const addTask = useConsole((s) => s.addTask);
  const setTaskStatus = useConsole((s) => s.setTaskStatus);
  return (
    <Shell scope="qrrupt" title="Tasks" eyebrow="Qrrupt Inc.">
      <QrSubnav />
      <RecordForm
        placeholder="Add Qrrupt task…"
        onAdd={(title) => addTask({ title, assignee: "Plug", status: "todo", company: "qrrupt" })}
      />
      <div className="rounded-lg border border-line bg-surface">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-4 border-b border-line last:border-0">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs text-muted mt-1">
                {t.assignee} · {t.status}
                {t.description ? ` · ${t.description}` : ""}
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
