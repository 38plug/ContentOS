import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";
import { MARKETS, MODES, ROLES } from "@/lib/seeds";
import { HfSubnav } from "@/components/hf-subnav";

export const Route = createFileRoute("/hireflow/register")({ component: Page });

function Page() {
  const addCandidate = useConsole((s) => s.addCandidate);
  const addInbox = useConsole((s) => s.addInbox);
  const inbox = useConsole((s) => s.inbox);
  const [form, setForm] = useState({
    name: "",
    companyCountry: "Vietnam",
    appliedFor: ROLES[0],
    market: MARKETS[0],
    communicationMode: MODES[0],
  });
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState("");

  function change(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Shell scope="hireflow" title="Register candidate" eyebrow="HireFlow">
      <HfSubnav />
      {saved ? (
        <div className="rounded-lg border border-line bg-surface p-10 text-center max-w-lg">
          <h2 className="text-lg font-semibold">{form.name} is on the desk</h2>
          <p className="text-sm text-muted mt-2">New Applicant from Telegram / register form.</p>
          <Link to="/hireflow/candidates" className="inline-flex min-h-11 px-4 mt-6 rounded-md bg-accent text-bg text-sm font-semibold items-center">
            View candidates
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_20rem] gap-4">
          <form
            className="rounded-lg border border-line bg-surface p-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim()) return;
              addCandidate({ ...form, status: "New Applicant", source: "Telegram" });
              setSaved(true);
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" value={form.name} onChange={(v) => change("name", v)} />
              <Field label="Company country" value={form.companyCountry} onChange={(v) => change("companyCountry", v)} />
              <Select label="Applied for" value={form.appliedFor} options={[...ROLES]} onChange={(v) => change("appliedFor", v)} />
              <Select label="Market" value={form.market} options={[...MARKETS]} onChange={(v) => change("market", v)} />
            </div>
            <div>
              <div className="text-xs text-muted mb-2">Communication mode</div>
              <div className="grid gap-2">
                {MODES.map((mode) => (
                  <label
                    key={mode}
                    className={`flex items-center gap-3 min-h-11 px-3 rounded-md border text-sm ${
                      form.communicationMode === mode ? "border-accent bg-accent-dim" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={form.communicationMode === mode}
                      onChange={() => change("communicationMode", mode)}
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </div>
            <button className="min-h-11 px-4 rounded-md bg-accent text-bg text-sm font-semibold">Register candidate</button>
          </form>
          <aside className="rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-line text-sm font-medium">Telegram workspace</div>
            <p className="px-4 py-2 text-[11px] text-muted">@overseasjobsHR · local inbox (no demo contacts)</p>
            <div className="px-3 pb-3 space-y-2 max-h-56 overflow-y-auto">
              {inbox.length === 0 ? (
                <p className="text-xs text-muted p-3">No live messages. Paste an applicant line below.</p>
              ) : (
                inbox.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full text-left rounded-md bg-elevated p-3"
                    onClick={() => change("name", m.name)}
                  >
                    <div className="text-sm">{m.name}</div>
                    <div className="text-xs text-muted truncate">{m.message}</div>
                  </button>
                ))
              )}
            </div>
            <form
              className="p-3 border-t border-line flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                addInbox({ name: draft.split(" ")[0] || "Applicant", handle: "", message: draft });
                setDraft("");
              }}
            >
              <input
                className="flex-1 min-h-11 rounded-md bg-bg border border-line px-2 text-xs"
                placeholder="Paste applicant message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </form>
          </aside>
        </div>
      )}
    </Shell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <input
        className="mt-1 w-full min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <select
        className="mt-1 w-full min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
