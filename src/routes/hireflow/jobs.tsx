import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { RecordForm, Row } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/jobs")({ component: Page });

function Page() {
  const jobs = useConsole((s) => s.jobs);
  const addJob = useConsole((s) => s.addJob);
  return (
    <Shell scope="hireflow" title="Jobs" eyebrow="HireFlow">
      <HfSubnav />
      <RecordForm
        placeholder="Add job title…"
        onAdd={(title) =>
          addJob({
            title,
            employer: "Nova Commerce",
            location: "Ho Chi Minh City, Vietnam",
            vacancies: 1,
            applicants: 0,
            status: "Active",
            market: "Crypto",
          })
        }
      />
      <div className="rounded-lg border border-line bg-surface px-4">
        {jobs.map((j) => (
          <Row
            key={j.id}
            initials={j.title}
            title={j.title}
            sub={`${j.employer} · ${j.location} · ${j.vacancies} seats · ${j.applicants} applicants`}
            badge={j.status}
          />
        ))}
      </div>
    </Shell>
  );
}
