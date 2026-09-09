import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { RecordForm, Row } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/hireflow/employers")({ component: Page });

function Page() {
  const employers = useConsole((s) => s.employers);
  const addEmployer = useConsole((s) => s.addEmployer);
  return (
    <Shell scope="hireflow" title="Employers" eyebrow="HireFlow">
      <HfSubnav />
      <RecordForm
        placeholder="Add employer…"
        onAdd={(name) =>
          addEmployer({
            name,
            country: "Vietnam",
            city: "Ho Chi Minh City",
            industry: "Operations",
            status: "Active",
          })
        }
      />
      <div className="rounded-lg border border-line bg-surface px-4">
        {employers.map((e) => (
          <Row key={e.id} initials={e.name} title={e.name} sub={`${e.city}, ${e.country} · ${e.industry}`} badge={e.status} />
        ))}
      </div>
    </Shell>
  );
}
