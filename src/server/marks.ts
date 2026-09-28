import type { DB } from "./types";

export type Mark = {
  id: string;
  date: string;
  title: string;
  href: string;
  kind: "limite" | "evento";
};

export function collectMarks(db: DB): Mark[] {
  const marks: Mark[] = db.events.map((event) => ({
    id: event.id,
    date: event.date,
    title: event.title,
    href: "/calendario",
    kind: event.kind,
  }));
  for (const budget of db.budgets) {
    if (!budget.dueDate) continue;
    marks.push({
      id: `budget-${budget.id}`,
      date: budget.dueDate,
      title: `Entregar: ${budget.title}`,
      href: `/presupuestos/${budget.id}`,
      kind: "limite",
    });
  }
  for (const post of db.posts) {
    if (!post.eventDate) continue;
    marks.push({
      id: `post-${post.id}`,
      date: post.eventDate,
      title: post.title,
      href: "/tablon",
      kind: "evento",
    });
  }
  return marks.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
