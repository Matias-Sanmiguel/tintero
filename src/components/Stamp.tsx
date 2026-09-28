import { budgetStatusLabel } from "@/server/format";
import type { BudgetStatus } from "@/server/types";

export function Stamp({ status }: { status: BudgetStatus }) {
  const tone =
    status === "aprobado"
      ? "ok"
      : status === "observado"
        ? "warn"
        : status === "rechazado"
          ? "bad"
          : "ink";
  return <span className={`stamp ${tone}`.trim()}>{budgetStatusLabel[status]}</span>;
}
