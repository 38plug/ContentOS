import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { useConsole } from "@/lib/console-store";
import { FINANCE_CATEGORIES } from "@/lib/seeds";
import { QrSubnav } from "@/components/qr-subnav";

export const Route = createFileRoute("/qrrupt/ledger")({ component: Page });

function Page() {
  const finance = useConsole((s) => s.finance);
  const addFinance = useConsole((s) => s.addFinance);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<(typeof FINANCE_CATEGORIES)[number]>("Other");
  const [description, setDescription] = useState("");

  return (
    <Shell scope="qrrupt" title="Ledger" eyebrow="Qrrupt Inc.">
      <QrSubnav />
      <form
        className="rounded-lg border border-line bg-surface p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(amount);
          if (!n) return;
          addFinance({
            type,
            amount: n,
            category,
            description: description || category,
            person: "Plug",
            date: new Date().toISOString().slice(0, 10),
          });
          setAmount("");
          setDescription("");
        }}
      >
        <select
          className="min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          className="min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
          placeholder="Amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof FINANCE_CATEGORIES)[number])}
        >
          {FINANCE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          className="min-h-11 rounded-md bg-bg border border-line px-3 text-sm"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="min-h-11 rounded-md bg-accent text-bg text-sm font-semibold">Log</button>
      </form>
      <div className="rounded-lg border border-line bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Memo</th>
              <th className="text-right pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {finance.map((e) => (
              <tr key={e.id} className="border-t border-line">
                <td className="px-4 py-3 tabular-nums text-muted">{e.date}</td>
                <td className={e.type === "income" ? "text-ok" : "text-danger"}>{e.type}</td>
                <td>{e.category}</td>
                <td className="text-muted">{e.description}</td>
                <td className="text-right pr-4 tabular-nums font-medium">
                  {e.type === "expense" ? "−" : "+"}${e.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
