export function Metrics({
  items,
}: {
  items: { label: string; value: string; detail?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((m) => (
        <div key={m.label} className="rounded-lg border border-line bg-surface p-4">
          <div className="text-xs text-muted">{m.label}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{m.value}</div>
          {m.detail ? <div className="mt-1 text-[11px] text-muted">{m.detail}</div> : null}
        </div>
      ))}
    </div>
  );
}
