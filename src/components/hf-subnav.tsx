import { Link } from "@tanstack/react-router";

const links = [
  ["/hireflow", "Dashboard"],
  ["/hireflow/candidates", "Candidates"],
  ["/hireflow/jobs", "Jobs"],
  ["/hireflow/pipeline", "Pipeline"],
  ["/hireflow/interviews", "Interviews"],
  ["/hireflow/employers", "Employers"],
  ["/hireflow/tasks", "Tasks"],
  ["/hireflow/register", "Register"],
] as const;

export function HfSubnav() {
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
