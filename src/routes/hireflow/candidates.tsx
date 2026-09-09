import { createFileRoute } from "@tanstack/react-router";
import { HfSubnav } from "@/components/hf-subnav";
import { RecordForm, Row } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";


export const Route = createFileRoute("/hireflow/candidates")({ component: Page });

function Page() {
  const candidates = useConsole((s) => s.candidates);
  const addCandidate = useConsole((s) => s.addCandidate);
  return (
    <Shell scope="hireflow" title="Candidates" eyebrow="HireFlow">
      <HfSubnav />
      <RecordForm
        placeholder="Add candidate name…"
        onAdd={(name) =>
          addCandidate({
            name,
            status: "New Applicant",
            appliedFor: "Call Center",
            companyCountry: "Vietnam",
            market: "Crypto",
            communicationMode: "Only Call",
            source: "Desk",
          })
        }
      />
      <div className="rounded-lg border border-line bg-surface px-4">
        {candidates.map((c) => (
          <Row
            key={c.id}
            initials={c.name}
            title={c.name}
            sub={`${c.status} · ${c.appliedFor} · ${c.market} · ${c.source}`}
            badge={c.status}
          />
        ))}
      </div>
    </Shell>
  );
}
