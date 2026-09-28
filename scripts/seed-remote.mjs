import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const cut = line.indexOf("=");
      return [line.slice(0, cut), line.slice(cut + 1)];
    }),
);

const db = JSON.parse(readFileSync(new URL("../data/store.json", import.meta.url), "utf8"));
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function put(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
}

await put(
  "members",
  db.members.map((member) => ({
    id: member.id,
    email: member.email,
    name: member.name,
    password_hash: member.passwordHash,
    role: member.role,
    career: member.career,
    year: member.year,
    status: member.status,
    joined_at: member.joinedAt,
  })),
);
await put(
  "ideas",
  db.ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    body: idea.body,
    tags: idea.tags,
    votes: idea.votes,
    author_id: idea.authorId,
    status: idea.status,
    project_id: idea.projectId,
    created_at: idea.createdAt,
  })),
);
await put(
  "projects",
  db.projects.map((project) => ({
    id: project.id,
    name: project.name,
    summary: project.summary,
    status: project.status,
    owner_id: project.ownerId,
    idea_id: project.ideaId,
    created_at: project.createdAt,
  })),
);
await put(
  "budgets",
  db.budgets.map((budget) => ({
    id: budget.id,
    project_id: budget.projectId,
    title: budget.title,
    recipient: budget.recipient,
    subject: budget.subject,
    rationale: budget.rationale,
    status: budget.status,
    due_date: budget.dueDate,
    items: budget.items,
    created_at: budget.createdAt,
  })),
);
await put(
  "inventory_items",
  db.inventory.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    condition: item.condition,
    location: item.location,
    holder: item.holder,
    project_id: item.projectId,
    created_at: item.createdAt,
  })),
);
await put(
  "posts",
  db.posts.map((post) => ({
    id: post.id,
    kind: post.kind,
    title: post.title,
    body: post.body,
    pinned: post.pinned,
    author_id: post.authorId,
    capacity: post.capacity,
    event_date: post.eventDate,
    signups: post.signups,
    comments: post.comments,
    created_at: post.createdAt,
  })),
);
await put(
  "events",
  db.events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    kind: event.kind,
    notes: event.notes,
    created_at: event.createdAt,
  })),
);

const { count, error } = await supabase.from("members").select("id", { count: "exact", head: true });
if (error) throw new Error(error.message);
console.log(`padrón en supabase: ${count}`);
