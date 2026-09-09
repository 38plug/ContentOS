import { useState } from "react";

export function RecordForm({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex gap-2 rounded-lg border border-line bg-surface p-2 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim());
        setName("");
      }}
    >
      <input
        className="flex-1 min-h-11 bg-transparent px-3 text-sm outline-none"
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="min-h-11 px-4 rounded-md bg-accent text-bg text-sm font-semibold">Add</button>
    </form>
  );
}

export function Row({
  initials,
  title,
  sub,
  badge,
}: {
  initials: string;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-line last:border-0">
      <div className="size-9 rounded-full bg-accent-dim text-accent text-[11px] font-bold grid place-items-center">
        {initials.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted truncate">{sub}</div>
      </div>
      {badge ? (
        <span className="text-[10px] uppercase tracking-wide text-ok bg-ok/10 px-2 py-1 rounded-full">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
