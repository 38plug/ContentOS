import { createFileRoute } from "@tanstack/react-router";
import { RecordForm, Row } from "@/components/record-list";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";
import { QrSubnav } from "@/components/qr-subnav";

export const Route = createFileRoute("/qrrupt/calendar")({ component: Page });

function Page() {
  const calendar = useConsole((s) => s.calendar);
  const meetings = useConsole((s) => s.meetings);
  const addEvent = useConsole((s) => s.addEvent);
  return (
    <Shell scope="qrrupt" title="Calendar" eyebrow="Qrrupt Inc.">
      <QrSubnav />
      <RecordForm
        placeholder="Add event title…"
        onAdd={(title) =>
          addEvent({
            title,
            date: new Date().toISOString().slice(0, 10),
            time: "09:00",
            notes: "",
            person: "Plug",
            repeat: "",
            important: false,
          })
        }
      />
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-lg border border-line bg-surface px-4">
          <h2 className="text-sm font-semibold pt-4">Events</h2>
          {calendar.map((e) => (
            <Row
              key={e.id}
              initials={e.title}
              title={e.title}
              sub={`${e.date} ${e.time} · ${e.notes || e.repeat || "once"}`}
              badge={e.important ? "key" : undefined}
            />
          ))}
        </section>
        <section className="rounded-lg border border-line bg-surface px-4">
          <h2 className="text-sm font-semibold pt-4">Meetings</h2>
          {meetings.map((m) => (
            <Row
              key={m.id}
              initials={m.title}
              title={m.title}
              sub={`${m.date} ${m.time} · ${m.attendees.join(", ")} · ${m.agenda}`}
            />
          ))}
        </section>
      </div>
    </Shell>
  );
}
