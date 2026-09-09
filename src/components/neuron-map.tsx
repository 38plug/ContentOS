import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useConsole } from "@/lib/console-store";
import type { KnowledgeNode, Scope } from "@/lib/types";

function pos(node: KnowledgeNode, i: number, n: number) {
  const ring = node.company === "atlas" ? 0.22 : 0.62;
  const slice =
    node.company === "hireflow"
      ? Math.PI * 0.15 + (i / Math.max(1, n)) * Math.PI * 0.9
      : node.company === "qrrupt"
        ? Math.PI * 1.15 + (i / Math.max(1, n)) * Math.PI * 0.9
        : (i / Math.max(1, n)) * Math.PI * 2;
  return { x: 50 + Math.cos(slice) * ring * 48, y: 50 + Math.sin(slice) * ring * 42 };
}

export function NeuronMap() {
  const knowledge = useConsole((s) => s.knowledge);
  const [sel, setSel] = useState<string | null>(knowledge.at(-1)?.id ?? null);
  const byCompany = useMemo(() => {
    const groups: Record<Scope, KnowledgeNode[]> = { atlas: [], hireflow: [], qrrupt: [] };
    for (const n of knowledge) groups[n.company].push(n);
    return groups;
  }, [knowledge]);
  const selected = knowledge.find((k) => k.id === sel) ?? knowledge.at(-1);

  const points = knowledge.map((node, _i) => {
    const group = byCompany[node.company];
    return { node, ...pos(node, group.indexOf(node), group.length) };
  });

  return (
    <section className="rounded-lg border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div>
          <h2 className="text-sm font-semibold">Learning graph</h2>
          <p className="text-xs text-muted mt-0.5">{knowledge.length} nodes · two clusters, one core</p>
        </div>
        <div className="flex gap-3 text-[10px] uppercase tracking-wider text-muted">
          <span className="text-accent">ATLAS</span>
          <span>HF</span>
          <span>QR</span>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <svg viewBox="0 0 100 100" className="w-full aspect-[16/10] bg-bg">
          {points.map((p) => (
            <line
              key={`l-${p.node.id}`}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              className="stroke-line"
              strokeWidth="0.3"
            />
          ))}
          <circle cx="50" cy="50" r="4.2" className="fill-accent-dim stroke-accent" strokeWidth="0.6" />
          <text x="50" y="51.2" textAnchor="middle" className="fill-accent" style={{ fontSize: 3.2 }}>
            J
          </text>
          {points.map((p) => (
            <g key={p.node.id} onClick={() => setSel(p.node.id)} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={sel === p.node.id ? 2.6 : 1.8}
                className={cn(
                  p.node.company === "hireflow"
                    ? "fill-ok"
                    : p.node.company === "qrrupt"
                      ? "fill-warn"
                      : "fill-accent",
                )}
              />
            </g>
          ))}
        </svg>
        <div className="p-4 border-t lg:border-t-0 lg:border-l border-line min-h-40">
          {selected ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-accent">{selected.kind}</div>
              <h3 className="text-base font-semibold mt-1">{selected.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{selected.detail}</p>
              <p className="text-[11px] text-muted mt-4 font-mono">{selected.company}</p>
            </>
          ) : (
            <p className="text-sm text-muted">No nodes yet. Teach JARVIS by doing work.</p>
          )}
        </div>
      </div>
    </section>
  );
}
