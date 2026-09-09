import { Link } from "@tanstack/react-router";

const links = [
  ["/qrrupt", "Books"],
  ["/qrrupt/ledger", "Ledger"],
  ["/qrrupt/calendar", "Calendar"],
  ["/qrrupt/tasks", "Tasks"],
] as const;

export function QrSubnav() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 -mt-2">
      {links.map(([href, label]) => (
        <Link
          key={href}
          to={href}
          className="shrink-0 min-h-11 px-3 grid place-items-center rounded-md text-xs font-medium border border-line bg-elevated text-muted"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
