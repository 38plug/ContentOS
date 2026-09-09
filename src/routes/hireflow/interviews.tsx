import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { RecordForm, Row } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/interviews")({ component: Page });

function Page() {
  const interviews = useConsole((s) => s.interviews);
  const addInterview = useConsole((s) => s.addInterview);
  return (
    <Shell scope="hireflow" title="Interviews" eyebrow="HireFlow">
      <HfSubnav />
      <RecordForm
        placeholder="Candidate name for a new slot…"
        onAdd={(candidate) =>
          addInterview({
            candidate,
            job: "Call Center",
            time: "14:00",
            date: new Date().toISOString().slice(0, 10),
            status: "Pending",
          })
        }
      />
      <div className="rounded-lg border border-line bg-surface px-4">
        {interviews.map((i) => (
          <Row key={i.id} initials={i.candidate} title={`${i.time} · ${i.candidate}`} sub={`${i.job} · ${i.date}`} badge={i.status} />
        ))}
      </div>
    </Shell>
  );
}
