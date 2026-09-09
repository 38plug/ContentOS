import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Metrics } from "@/components/metric";
import { QrSubnav } from "@/components/qr-subnav";
import { Shell } from "@/components/shell";
import { cashOf, useConsole } from "@/lib/console-store";

export const Route = createFileRoute("/qrrupt/")({ component: Page });

function Page() {
  const finance = useConsole((s) => s.finance);
  const tasksAll = useConsole((s) => s.tasks);
  const tasks = tasksAll.filter((t) => t.company === "qrrupt");
  const cash = cashOf(finance);
  const income = finance.filter((e) => e.type === "income").reduce((n, e) => n + e.amount, 0);
  const expense = finance.filter((e) => e.type === "expense").reduce((n, e) => n + e.amount, 0);
  const byDay = [...finance].sort((a, b) => a.date.localeCompare(b.date));
  let run = 0;
  const chart = byDay.map((e) => {
    run += e.type === "income" ? e.amount : -e.amount;
    return { date: e.date.slice(5), value: run };
  });

  return (
    <Shell scope="qrrupt" title="Qrrupt Inc." eyebrow="Financial console">
      <QrSubnav />
      <Metrics
        items={[
          { label: "Net cash", value: `$${cash}`, detail: "from your 31 Aug backup +" },
          { label: "Income", value: `$${income}` },
          { label: "Spend", value: `$${expense}` },
          { label: "Open QR tasks", value: String(tasks.filter((t) => t.status !== "done").length) },
        ]}
      />
      <section className="mt-4 rounded-lg border border-line bg-surface p-4 h-56">
        <h2 className="text-sm font-semibold mb-2">Cash path</h2>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chart.length ? chart : [{ date: "—", value: 0 }]}>
            <XAxis dataKey="date" stroke="#7d8a9c" fontSize={11} />
            <YAxis stroke="#7d8a9c" fontSize={11} width={36} />
            <Tooltip contentStyle={{ background: "#10151d", border: "1px solid #232a36" }} />
            <Area type="monotone" dataKey="value" stroke="#3ee0ff" fill="#1a4c58" />
          </AreaChart>
        </ResponsiveContainer>
      </section>
      <p className="text-xs text-muted mt-4">
        Wallet addresses and login hashes from the backup were not imported. Rotate those keys — they were in the upload.
      </p>
    </Shell>
  );
}
