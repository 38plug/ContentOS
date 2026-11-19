import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import { listContentItems } from "@/lib/contentos/server";
import type { ContentItem } from "@/lib/contentos/types";
import { platformLabel, statusLabel } from "@/lib/contentos/types";

export const Route = createFileRoute("/queue")({ component: QueuePage });

function QueuePage() {
  return (
    <AuthGate>
      <QueueView />
    </AuthGate>
  );
}

function itemDate(item: ContentItem): string | null {
  return item.scheduledAt || item.publishedAt || null;
}

function QueueView() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    void listContentItems()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load queue"));
  }, []);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)),
    [weekAnchor],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const day of days) map.set(format(day, "yyyy-MM-dd"), []);
    for (const item of items) {
      const d = itemDate(item);
      if (!d) continue;
      const key = d.slice(0, 10);
      if (!map.has(key)) continue;
      map.get(key)!.push(item);
    }
    return map;
  }, [days, items]);

  const undated = items.filter((item) => !itemDate(item) && (item.status === "draft" || item.status === "idea"));

  return (
    <AppShell
      title="Publish queue"
      action={
        <Link to="/library" className="cos-btn">
          Open library
        </Link>
      }
    >
      {error ? <p className="cos-error">{error}</p> : null}

      <div className="cos-filters" style={{ alignItems: "center" }}>
        <button
          type="button"
          className="cos-btn secondary"
          onClick={() => setWeekAnchor((w) => addDays(w, -7))}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <strong style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
          {format(weekAnchor, "MMM d")} – {format(addDays(weekAnchor, 6), "MMM d, yyyy")}
        </strong>
        <button
          type="button"
          className="cos-btn secondary"
          onClick={() => setWeekAnchor((w) => addDays(w, 7))}
        >
          Next <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className="cos-btn ghost"
          onClick={() => setWeekAnchor(startOfWeek(new Date(), { weekStartsOn: 1 }))}
        >
          This week
        </button>
      </div>

      <div className="cos-week-grid">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const list = byDay.get(key) ?? [];
          const today = isSameDay(day, new Date());
          return (
            <section key={key} className={today ? "cos-day today" : "cos-day"}>
              <header>
                <strong>{format(day, "EEE")}</strong>
                <span>{format(day, "d")}</span>
              </header>
              <div className="cos-day-list">
                {list.map((item) => (
                  <Link
                    key={item.id}
                    to="/library"
                    search={{ id: item.id }}
                    className="cos-day-card"
                  >
                    <span className="cos-pill muted">{statusLabel(item.status)}</span>
                    <strong>{item.title}</strong>
                    <small>{platformLabel(item.platform)}</small>
                  </Link>
                ))}
                {!list.length ? <p className="sub">Open slot</p> : null}
              </div>
            </section>
          );
        })}
      </div>

      <section className="cos-panel" style={{ marginTop: 16 }}>
        <h2>Backlog (no date)</h2>
        <p className="sub">Ideas and drafts waiting to be scheduled.</p>
        <div className="cos-list">
          {undated.map((item) => (
            <Link key={item.id} to="/library" search={{ id: item.id }} className="cos-row">
              <div>
                <strong>{item.title}</strong>
                <small>
                  {platformLabel(item.platform)} · {statusLabel(item.status)}
                </small>
              </div>
              <span className="cos-pill muted">Schedule</span>
            </Link>
          ))}
          {!undated.length ? <p className="sub">Queue is clear — every active item has a date.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
