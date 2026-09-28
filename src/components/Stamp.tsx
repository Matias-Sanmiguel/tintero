import { Badge } from "@/components/ui/badge";
import { budgetStatusLabel } from "@/server/format";
import type { BudgetStatus } from "@/server/types";

export function Stamp({ status }: { status: BudgetStatus }) {
  if (status === "aprobado") {
    return <Badge className="bg-accent text-accent-foreground">{budgetStatusLabel[status]}</Badge>;
  }
  if (status === "observado") {
    return <Badge variant="outline">{budgetStatusLabel[status]}</Badge>;
  }
  if (status === "rechazado") {
    return <Badge variant="destructive">{budgetStatusLabel[status]}</Badge>;
  }
  return <Badge variant="secondary">{budgetStatusLabel[status]}</Badge>;
}
