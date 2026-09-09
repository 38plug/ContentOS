import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Bell, CalendarDays, ChevronDown, FileText, Instagram, LayoutDashboard, Plus, Search, Settings, Sparkles, TrendingUp, Users, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

type Platform = "overview" | "youtube" | "tiktok" | "instagram";

const platforms = {
  overview: { label: "Overview", color: "#9b7cff", soft: "rgba(155,124,255,.14)" },
  youtube: { label: "YouTube", color: "#ff3d5a", soft: "rgba(255,61,90,.14)" },
  tiktok: { label: "TikTok", color: "#2de2e6", soft: "rgba(45,226,230,.14)" },
  instagram: { label: "Instagram", color: "#f276c8", soft: "rgba(242,118,200,.14)" },
};

function Home() {
  const [platform, setPlatform] = useState<Platform>("overview");
  const theme = platforms[platform];
  const [range, setRange] = useState("Last 30 days");
  const [metricFilter, setMetricFilter] = useState<"views" | "revenue">("revenue");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [scriptSaved, setScriptSaved] = useState(false);
  const [savedScripts, setSavedScripts] = useState<string[]>([]);
  const [scheduled, setScheduled] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("2026-06-24");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduledPosts, setScheduledPosts] = useState<{ title: string; date: string; time: string; platform: string }[]>([]);
  const [showAllScripts, setShowAllScripts] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>(["youtube"]);
  const rangeMultiplier = range === "Last 7 days" ? 0.24 : range === "Last 90 days" ? 2.72 : 1;
  const revenueValue = `$${(2846.2 * rangeMultiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const viewsValue = `${(1.84 * rangeMultiplier).toFixed(2)}M`;

  useEffect(() => {
    const stored = window.localStorage.getItem("creatorly-scripts");
    if (stored) setSavedScripts(JSON.parse(stored));
    const storedPosts = window.localStorage.getItem("creatorly-posts");
    if (storedPosts) setScheduledPosts(JSON.parse(storedPosts));
    const storedPlatforms = window.localStorage.getItem("creatorly-platforms");
    if (storedPlatforms) setConnectedPlatforms(JSON.parse(storedPlatforms));
  }, []);

  function saveScript() {
    const next = Array.from(new Set([topic.trim() || "Untitled script", ...savedScripts]));
    setSavedScripts(next);
    setScriptSaved(true);
    window.localStorage.setItem("creatorly-scripts", JSON.stringify(next));
  }

  return (
    <div className="creator-app" style={{ "--platform": theme.color, "--platform-soft": theme.soft } as React.CSSProperties}>
      <aside className="creator-sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Content<span className="brand-dot">OS</span></span></div>
        <div className="workspace"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><small>ContentOS workspace</small></div><ChevronDown size={15} /></div>
        <nav>
          <p className="nav-label">Workspace</p>
          <a className="side-link active"><LayoutDashboard size={17} />Overview</a>
          <a className="side-link"><Sparkles size={17} />AI Assistant<span className="new-pill">NEW</span></a>
          <a className="side-link"><CalendarDays size={17} />Content calendar</a>
          <a className="side-link"><FileText size={17} />My scripts</a>
          <p className="nav-label second">Manage</p>
          <a className="side-link"><BarChart3 size={17} />Analytics</a>
          <a className="side-link"><Users size={17} />Audience</a>
          <a className="side-link"><Settings size={17} />Settings</a>
        </nav>
        <div className="upgrade-card"><Sparkles size={18} /><strong>Unlock your growth</strong><p>Get unlimited AI scripts and advanced analytics.</p><button>Upgrade plan</button></div>
        <div className="sidebar-footer"><div className="avatar small">JD</div><div><strong>Jordan Davis</strong><small>Free plan</small></div><span className="status-dot" /></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand">Content<span>OS</span></div><div className="platform-tabs">{(Object.keys(platforms) as Platform[]).map((key) => <button key={key} className={platform === key ? "platform-tab selected" : "platform-tab"} style={platform === key ? { color: platforms[key].color, background: platforms[key].soft } : undefined} onClick={() => setPlatform(key)}>{key === "youtube" ? <Youtube size={17} /> : key === "instagram" ? <Instagram size={17} /> : key === "tiktok" ? <span className="tiktok-icon">♪</span> : <LayoutDashboard size={17} />}{platforms[key].label}</button>)}</div><div className="top-actions"><button className="icon-button"><Search size={18} /></button><button className="icon-button"><Bell size={18} /><i /></button><div className="top-avatar">JD</div></div></header>
        <section className="content">
          <div className="welcome-row"><div><p className="eyebrow">{theme.label} workspace</p><h1>Good morning, Jordan <span>✦</span></h1><p className="subtext">Here is what is happening with your content today.</p></div><button className="primary-button" onClick={() => setAssistantOpen(true)}><Plus size={17} />Create content</button></div>
          <div className="stats-grid"><Stat label="Estimated revenue" value="$2,846.20" change="+18.4%" icon="$" /><Stat label="Total views" value="1.84M" change="+24.8%" icon="◉" /><Stat label="Engagement rate" value="8.42%" change="+2.1%" icon="↗" /><Stat label="Followers" value="48,291" change="+1,204" icon="♧" /></div>
          <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-header"><div><h2>{metricFilter === "revenue" ? "Revenue overview" : "Views overview"}</h2><p>{metricFilter === "revenue" ? "Estimated earnings across all platforms" : "Content reach across all platforms"}</p></div><div className="chart-controls"><button className={metricFilter === "revenue" ? "filter-active" : ""} onClick={() => setMetricFilter("revenue")}>Revenue</button><button className={metricFilter === "views" ? "filter-active" : ""} onClick={() => setMetricFilter("views")}>Views</button><select value={range} onChange={(e) => setRange(e.target.value)}><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select></div></div><div className="revenue-value">{metricFilter === "revenue" ? revenueValue : viewsValue} <span>{metricFilter === "revenue" ? "+18.4%" : "+24.8%"}</span></div><div className="chart"><div className="chart-y"><span>{metricFilter === "revenue" ? "$3k" : "2M"}</span><span>{metricFilter === "revenue" ? "$2k" : "1M"}</span><span>{metricFilter === "revenue" ? "$1k" : "500k"}</span><span>0</span></div><div className="chart-body"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 180" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--platform)" stopOpacity=".35" /><stop offset="1" stopColor="var(--platform)" stopOpacity="0" /></linearGradient></defs><path d="M0 148 C45 140 65 145 100 121 S160 136 195 106 S245 114 280 88 S330 100 365 92 S410 72 445 80 S490 63 520 56 S570 75 600 41 S650 55 700 18 V180 H0Z" fill="url(#fill)" /><path d="M0 148 C45 140 65 145 100 121 S160 136 195 106 S245 114 280 88 S330 100 365 92 S410 72 445 80 S490 63 520 56 S570 75 600 41 S650 55 700 18" fill="none" stroke="var(--platform)" strokeWidth="3" /></svg><div className="chart-x"><span>May 01</span><span>May 08</span><span>May 15</span><span>May 22</span><span>May 30</span></div></div></div></section>
          <section className="panel platform-panel"><div className="panel-header"><div><h2>Platform performance</h2><p>Revenue contribution</p></div><button className="more">•••</button></div><div className="donut-wrap"><div className="donut"><div><strong>$2,846</strong><small>Total revenue</small></div></div></div><div className="legend"><Legend color="#ff3d5a" name="YouTube" value="$1,640.80" percent="57.7%" /><Legend color="#2de2e6" name="TikTok" value="$712.40" percent="25.0%" /><Legend color="#f276c8" name="Instagram" value="$493.00" percent="17.3%" /></div><div className="connect-row"><div><strong>Connect platforms</strong><small>Sync your latest analytics</small></div><div className="connect-buttons">{(["youtube", "tiktok", "instagram"] as Platform[]).map((key) => <button key={key} className={connectedPlatforms.includes(key) ? "connected" : ""} onClick={() => setConnectedPlatforms((items) => { const next = items.includes(key) ? items.filter((item) => item !== key) : [...items, key]; window.localStorage.setItem("creatorly-platforms", JSON.stringify(next)); return next; })}>{key === "youtube" ? <Youtube size={13} /> : key === "instagram" ? <Instagram size={13} /> : <span className="tiktok-icon">♪</span>}{connectedPlatforms.includes(key) ? "Connected" : "Connect"}</button>)}</div></div></section></div>
          {savedScripts.length > 0 ? <section className="panel saved-panel"><div className="panel-header"><div><h2>My scripts</h2><p>Your saved ideas, ready to develop</p></div><button className="text-button" onClick={() => setShowAllScripts(!showAllScripts)}>{showAllScripts ? "Show less" : "View all"} <span>→</span></button></div><div className="saved-script-list">{savedScripts.slice(0, showAllScripts ? savedScripts.length : 3).map((script) => <div className="saved-script" key={script}><FileText size={16} /><strong>{script}</strong><span>Draft</span><button className="delete-script" aria-label={`Delete ${script}`} onClick={() => { const next = savedScripts.filter((item) => item !== script); setSavedScripts(next); window.localStorage.setItem("creatorly-scripts", JSON.stringify(next)); }}>×</button></div>)}</div></section> : null}
          <div className="bottom-grid"><section className="panel"><div className="panel-header"><div><h2>Content performance</h2><p>Your best performing posts this month</p></div><button className="text-button">View all <span>→</span></button></div><div className="post-list"><Post title="3 habits that changed my life" platform="YouTube" views="482.1K" rate="12.4%" color="#ff3d5a" /><Post title="Stop waiting for motivation" platform="TikTok" views="328.7K" rate="9.8%" color="#2de2e6" /><Post title="My creator setup in 2024" platform="Instagram" views="189.2K" rate="8.6%" color="#f276c8" /></div></section><section className="panel calendar-panel"><div className="panel-header"><div><h2>Next up</h2><p>Scheduled content</p></div><button className="text-button">Calendar <span>→</span></button></div>{(scheduledPosts.length ? scheduledPosts : [{ title: "How to grow on YouTube", date: "2026-06-24", time: "10:00", platform: "YouTube" }, { title: "Creator Q&A: ask me anything", date: "2026-06-26", time: "18:30", platform: "TikTok" }]).slice(0, 3).map((post, index) => <div className="schedule" key={`${post.title}-${post.date}`}><div className="date-box"><strong>{post.date.slice(-2)}</strong><small>{post.date.slice(5, 7) === "06" ? "JUN" : post.date.slice(5, 7)}</small></div><div><strong>{post.title}</strong><small>{post.platform === "YouTube" ? <Youtube size={13} /> : <span className="tiktok-icon">♪</span>} {post.platform} · {post.time}</small></div><span className={index === 1 && !scheduledPosts.length ? "draft" : "scheduled"}>{index === 1 && !scheduledPosts.length ? "Draft" : "Scheduled"}</span>{scheduledPosts.length > 0 ? <button className="delete-script" aria-label={`Delete ${post.title}`} onClick={() => { const next = scheduledPosts.filter((item) => item.title !== post.title || item.date !== post.date); setScheduledPosts(next); window.localStorage.setItem("creatorly-posts", JSON.stringify(next)); }}>×</button> : null}</div>)}</section></div>
        </section>
        {scheduleOpen ? <div className="modal-backdrop" onClick={() => setScheduleOpen(false)}><section className="schedule-modal" onClick={(e) => e.stopPropagation()}><div className="modal-top"><div><p className="eyebrow">Content calendar</p><h2>Schedule post</h2><p>Choose when your content should go live.</p></div><button className="close-button" onClick={() => setScheduleOpen(false)}>×</button></div><div className="assistant-options"><label>Date<input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} /></label><label>Time<input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} /></label></div><div className="script-preview"><CalendarDays size={16} /><div><strong>{topic.trim() || "Untitled script"}</strong><p>{scheduleDate} · {scheduleTime} · {theme.label}</p></div></div><button className="primary-button full-button" onClick={() => { const next = [{ title: topic.trim() || "Untitled script", date: scheduleDate, time: scheduleTime, platform: theme.label }, ...scheduledPosts]; setScheduledPosts(next); window.localStorage.setItem("creatorly-posts", JSON.stringify(next)); setScheduled(true); setScheduleOpen(false); }}><CalendarDays size={16} />Confirm schedule</button></section></div> : null}
        {assistantOpen ? <div className="modal-backdrop" onClick={() => setAssistantOpen(false)}><section className="assistant-modal" onClick={(e) => e.stopPropagation()}><div className="modal-top"><div><p className="eyebrow">AI assistant</p><h2>Create your next post</h2><p>Turn one idea into a ready-to-record short.</p></div><button className="close-button" onClick={() => setAssistantOpen(false)}>×</button></div><label>What do you want to talk about?<textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Example: 3 habits that make creators more consistent" /></label><div className="assistant-options"><label>Platform<select><option>YouTube Shorts</option><option>TikTok</option><option>Instagram Reels</option></select></label><label>Format<select><option>30 second short</option><option>60 second short</option><option>Storytelling</option></select></label></div>{scriptGenerated ? <div className="generated-script"><div className="script-title"><span><Sparkles size={15} /> Generated script</span><small>30 sec · {theme.label}</small></div><h3>{topic.trim() || "Stop waiting for motivation."}</h3><p><strong>Hook:</strong> You do not need more motivation. You need a system that works on your worst days.</p><p><strong>Value:</strong> Pick one tiny action, attach it to an existing habit, and make starting impossible to avoid. Small wins build the identity that keeps you moving.</p><p><strong>CTA:</strong> Save this for your next low-energy day and follow for more creator systems.</p><div className="script-actions"><button className="copy-script" onClick={() => navigator.clipboard?.writeText(`${topic.trim()}. You do not need more motivation. You need a system that works on your worst days.`)}>Copy script</button><button className="copy-script" onClick={saveScript}>{scriptSaved ? "Saved to My scripts" : "Save script"}</button><button className="copy-script" onClick={() => setScheduleOpen(true)}>{scheduled ? "Added to calendar" : "Schedule post"}</button></div></div> : <div className="script-preview"><Sparkles size={16} /><div><strong>Your script will include</strong><p>Hook · Value points · Call to action · Caption</p></div></div>}<button className="primary-button full-button" onClick={() => { if (topic.trim()) setScriptGenerated(true); }}><Sparkles size={16} />{scriptGenerated ? "Regenerate script" : "Generate script"}</button>{!topic.trim() && <p className="input-hint">Enter topic first to generate script.</p>}</section></div> : null}
      </main>
    </div>
  );
}

function Stat({ label, value, change, icon }: { label: string; value: string; change: string; icon: string }) { return <div className="stat-card"><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong><small><TrendingUp size={12} /> {change} <em>vs last month</em></small></div></div>; }
function Legend({ color, name, value, percent }: { color: string; name: string; value: string; percent: string }) { return <div className="legend-row"><span className="legend-name"><i style={{ background: color }} />{name}</span><strong>{value}</strong><small>{percent}</small></div>; }
function Post({ title, platform, views, rate, color }: { title: string; platform: string; views: string; rate: string; color: string }) { return <div className="post-row"><div className="thumb" style={{ background: `linear-gradient(135deg, ${color}, #19152c)` }}><Sparkles size={18} /></div><div className="post-title"><strong>{title}</strong><small><span style={{ color }}>●</span> {platform}</small></div><div className="post-metric"><strong>{views}</strong><small>Views</small></div><div className="post-metric"><strong>{rate}</strong><small>Engagement</small></div><button className="more">•••</button></div>; }
