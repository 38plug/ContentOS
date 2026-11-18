import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, AuthGate } from "@/components/contentos/app-shell";
import { getDashboard } from "@/lib/contentos/server";
import type { Clip, ContentItem, DashboardStats } from "@/lib/contentos/types";
import { formatTimecode, platformLabel, statusLabel } from "@/lib/contentos/types";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <AuthGate>
      <StudioHome />
    </AuthGate>
  );
}

function StudioHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getDashboard()
      .then((data) => {
        if (!alive) return;
        setStats(data.stats);
        setPosts(data.recentPosts);
        setClips(data.recentClips);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load studio");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppShell
      title="Editorial studio"
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/library" className="cos-btn secondary">
            <Plus size={16} /> New post
          </Link>
          <Link to="/clip" className="cos-btn">
            <Scissors size={16} /> Clip YouTube
          </Link>
        </div>
      }
    >
      {error ? <p className="cos-error">{error}</p> : null}
      <div className="cos-grid-stats">
        <div className="cos-stat">
          <span>Library posts</span>
          <strong>{stats?.posts ?? "—"}</strong>
        </div>
        <div className="cos-stat" style={{ animationDelay: "60ms" }}>
          <span>Published</span>
          <strong>{stats?.published ?? "—"}</strong>
        </div>
        <div className="cos-stat" style={{ animationDelay: "120ms" }}>
          <span>Clips ready</span>
          <strong>{stats?.clips ?? "—"}</strong>
        </div>
        <div className="cos-stat" style={{ animationDelay: "180ms" }}>
          <span>Tracked views</span>
          <strong>{stats ? stats.totalViews.toLocaleString() : "—"}</strong>
        </div>
      </div>

      <div className="cos-split">
        <section className="cos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2>Recent posts</h2>
              <p className="sub">Your content tracker — platforms, status, performance.</p>
            </div>
            <Link to="/library" className="cos-btn ghost">
              Open library <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="cos-list">
            {posts.map((post) => (
              <Link key={post.id} to="/library" search={{ id: post.id }} className="cos-row">
                <div>
                  <strong>{post.title}</strong>
                  <small>
                    {platformLabel(post.platform)} · {statusLabel(post.status)}
                  </small>
                </div>
                <span className="cos-pill muted">{post.views.toLocaleString()} views</span>
              </Link>
            ))}
            {!posts.length && !error ? <p className="sub">Seeding demo library…</p> : null}
          </div>
        </section>

        <section className="cos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2>Clip queue</h2>
              <p className="sub">Edit decisions + SEO packages ready to ship.</p>
            </div>
            <Link to="/clips" className="cos-btn ghost">
              All clips <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="cos-list">
            {clips.map((clip) => (
              <Link key={clip.id} to="/clip/$clipId" params={{ clipId: clip.id }} className="cos-row">
                <div>
                  <strong>{clip.title}</strong>
                  <small>
                    {formatTimecode(clip.inSec)}–{formatTimecode(clip.outSec)} · {clip.aspect}
                  </small>
                </div>
                <span className="cos-pill">{clip.exportPackage.mediaStatus}</span>
              </Link>
            ))}
            {!clips.length && !error ? <p className="sub">No clips yet — analyze a YouTube URL.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
