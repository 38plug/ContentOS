import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import {
  deleteContentItem,
  listContentItems,
  upsertContentItem,
} from "@/lib/contentos/server";
import type { ContentItem, Platform, Status } from "@/lib/contentos/types";
import { PLATFORMS, STATUSES, platformLabel, statusLabel } from "@/lib/contentos/types";

type Search = { id?: string };

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <AuthGate>
      <LibraryView />
    </AuthGate>
  );
}

const emptyForm = {
  title: "",
  platform: "youtube" as Platform,
  status: "draft" as Status,
  scheduledAt: "",
  publishedAt: "",
  notes: "",
  views: 0,
  likes: 0,
  comments: 0,
};

function LibraryView() {
  const { id: focusId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const rows = await listContentItems();
    setItems(rows);
    return rows;
  }

  useEffect(() => {
    let alive = true;
    void refresh()
      .then((rows) => {
        if (!alive) return;
        const pick = focusId && rows.find((r) => r.id === focusId);
        if (pick) {
          setSelectedId(pick.id);
          hydrate(pick);
        }
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load library");
      });
    return () => {
      alive = false;
    };
  }, [focusId]);

  function hydrate(item: ContentItem) {
    setForm({
      title: item.title,
      platform: item.platform,
      status: item.status,
      scheduledAt: item.scheduledAt ?? "",
      publishedAt: item.publishedAt ?? "",
      notes: item.notes,
      views: item.views,
      likes: item.likes,
      comments: item.comments,
    });
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (platform === "all" || item.platform === platform) &&
          (status === "all" || item.status === status),
      ),
    [items, platform, status],
  );

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const saved = await upsertContentItem({
        data: {
          id: selectedId ?? undefined,
          title: form.title,
          platform: form.platform,
          status: form.status,
          scheduledAt: form.scheduledAt || null,
          publishedAt: form.publishedAt || null,
          notes: form.notes,
          views: Number(form.views) || 0,
          likes: Number(form.likes) || 0,
          comments: Number(form.comments) || 0,
        },
      });
      await refresh();
      setSelectedId(saved.id);
      hydrate(saved);
      void navigate({ search: { id: saved.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await deleteContentItem({ data: { id: selectedId } });
      setSelectedId(null);
      setForm(emptyForm);
      await refresh();
      void navigate({ search: {} });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Content library"
      action={
        <button
          type="button"
          className="cos-btn"
          onClick={() => {
            setSelectedId(null);
            setForm(emptyForm);
            void navigate({ search: {} });
          }}
        >
          <Plus size={16} /> New item
        </button>
      }
    >
      {error ? <p className="cos-error">{error}</p> : null}
      <div className="cos-filters">
        <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "all")}>
          <option value="all">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {platformLabel(p)}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="cos-library-layout">
        <section className="cos-panel">
          <h2>Posts</h2>
          <p className="sub">{filtered.length} items in view</p>
          <div className="cos-table" style={{ marginTop: 14 }}>
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === selectedId ? "cos-item active" : "cos-item"}
                onClick={() => {
                  setSelectedId(item.id);
                  hydrate(item);
                  void navigate({ search: { id: item.id } });
                }}
              >
                <div>
                  <strong>{item.title}</strong>
                  <small style={{ color: "var(--color-muted)", display: "block", marginTop: 6 }}>
                    {platformLabel(item.platform)} · {statusLabel(item.status)}
                  </small>
                </div>
                <div className="cos-metrics">
                  <span>{item.views.toLocaleString()}v</span>
                  <span>{item.likes.toLocaleString()}♥</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="cos-panel">
          <h2>{selectedId ? "Edit post" : "New post"}</h2>
          <p className="sub">Track status, schedule, and performance snapshots.</p>
          <div className="cos-form-grid" style={{ marginTop: 14 }}>
            <div className="cos-field wide">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="cos-field">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Platform }))}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {platformLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="cos-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="cos-field">
              <label htmlFor="scheduled">Scheduled</label>
              <input
                id="scheduled"
                type="date"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div className="cos-field">
              <label htmlFor="published">Published</label>
              <input
                id="published"
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
              />
            </div>
            <div className="cos-field">
              <label htmlFor="views">Views</label>
              <input
                id="views"
                type="number"
                value={form.views}
                onChange={(e) => setForm((f) => ({ ...f, views: Number(e.target.value) }))}
              />
            </div>
            <div className="cos-field">
              <label htmlFor="likes">Likes</label>
              <input
                id="likes"
                type="number"
                value={form.likes}
                onChange={(e) => setForm((f) => ({ ...f, likes: Number(e.target.value) }))}
              />
            </div>
            <div className="cos-field">
              <label htmlFor="comments">Comments</label>
              <input
                id="comments"
                type="number"
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: Number(e.target.value) }))}
              />
            </div>
            <div className="cos-field wide">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="button" className="cos-btn" disabled={busy || !form.title.trim()} onClick={() => void save()}>
              {busy ? "Saving…" : "Save"}
            </button>
            {selectedId ? (
              <button type="button" className="cos-btn secondary" disabled={busy} onClick={() => void remove()}>
                <Trash2 size={15} /> Delete
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
