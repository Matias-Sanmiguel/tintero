import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hashPassword } from "./password";
import type {
  Budget,
  BudgetItem,
  CalEvent,
  Comment,
  DB,
  Idea,
  InventoryItem,
  Member,
  Post,
  Project,
} from "./types";

const file = path.join(process.cwd(), "data", "store.json");

let chain: Promise<unknown> = Promise.resolve();

function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function supabaseOn() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function supabase(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function asArray<T>(value: unknown, map: (row: unknown) => T): T[] {
  if (Array.isArray(value)) return value.map(map);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(map) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asStrings(value: unknown) {
  return asArray(value, (item) => String(item));
}

function seed(): DB {
  const passwordHash = hashPassword(process.env.SEED_PASSWORD || "tintero-local");
  const presidencia = randomUUID();
  const comision = randomUUID();
  const miembro = randomUUID();
  const ideaTaller = randomUUID();
  const ideaJuegos = randomUUID();
  const projectId = randomUUID();
  const budgetId = randomUUID();
  const now = "2026-09-20T15:00:00.000Z";

  const members: Member[] = [
    {
      id: presidencia,
      email: "presidencia@clubinformatica.uade",
      name: "Presidencia del club",
      passwordHash,
      role: "presidente",
      career: "Ingeniería Informática",
      year: "4",
      status: "activo",
      joinedAt: "2026-03-10T12:00:00.000Z",
    },
    {
      id: comision,
      email: "comision@clubinformatica.uade",
      name: "Comisión",
      passwordHash,
      role: "comision",
      career: "Ingeniería Informática",
      year: "3",
      status: "activo",
      joinedAt: "2026-03-12T12:00:00.000Z",
    },
    {
      id: miembro,
      email: "miembro@clubinformatica.uade",
      name: "Miembro",
      passwordHash,
      role: "miembro",
      career: "Licenciatura en Gestión de TI",
      year: "2",
      status: "activo",
      joinedAt: "2026-08-18T12:00:00.000Z",
    },
  ];

  const ideas: Idea[] = [
    {
      id: ideaTaller,
      title: "Taller de Git para primer año",
      body: "Una tarde en un laboratorio para enseñar clone, branch y pull request. Hace falta reservar aula y, si se puede, un par de premios simbólicos.",
      tags: ["taller", "primer año"],
      votes: [miembro, comision],
      authorId: miembro,
      status: "promovida",
      projectId,
      createdAt: "2026-09-12T18:00:00.000Z",
    },
    {
      id: ideaJuegos,
      title: "Noche de juegos en la sede",
      body: "Una juntada corta, sin plata de la facultad, para que entre gente nueva al club.",
      tags: ["comunidad"],
      votes: [presidencia],
      authorId: comision,
      status: "abierta",
      projectId: null,
      createdAt: "2026-09-22T18:00:00.000Z",
    },
    {
      id: randomUUID(),
      title: "Grupo de estudio de algoritmos",
      body: "Encuentro semanal antes de los parciales. No pide presupuesto, pide aula y un responsable.",
      tags: ["estudio"],
      votes: [],
      authorId: miembro,
      status: "abierta",
      projectId: null,
      createdAt: "2026-09-25T18:00:00.000Z",
    },
  ];

  const projects: Project[] = [
    {
      id: projectId,
      name: "Hackatón interna 2026",
      summary:
        "Un día de trabajo en equipos, con placas para los prototipos, premios y algo para comer. Se presenta el presupuesto a la facultad.",
      status: "presupuesto",
      ownerId: presidencia,
      ideaId: ideaTaller,
      createdAt: now,
    },
  ];

  const budgets: Budget[] = [
    {
      id: budgetId,
      projectId,
      title: "Hackatón interna 2026",
      recipient: "Secretaría de la facultad",
      subject: "Pedido de fondos para la hackatón interna del Club de Informática",
      rationale:
        "La hackatón reúne a estudiantes de la carrera en un día de trabajo por equipos. El pedido cubre componentes para los prototipos, premios y un refrigerio. Los precios salen de publicaciones vigentes de los proveedores linkeados.",
      status: "borrador",
      dueDate: "2026-10-15",
      items: [
        {
          id: randomUUID(),
          description: "Placas y cables",
          quantity: 6,
          unitPrice: 31000,
          supplierUrl: "https://www.example.com/placas",
        },
        {
          id: randomUUID(),
          description: "Premios",
          quantity: 3,
          unitPrice: 30000,
          supplierUrl: "",
        },
        {
          id: randomUUID(),
          description: "Catering",
          quantity: 1,
          unitPrice: 45000,
          supplierUrl: "",
        },
      ],
      createdAt: now,
    },
  ];

  const inventory: InventoryItem[] = [
    {
      id: randomUUID(),
      name: "Kit Arduino UNO",
      quantity: 4,
      condition: "disponible",
      location: "Armario del laboratorio",
      holder: "",
      projectId: null,
      createdAt: now,
    },
    {
      id: randomUUID(),
      name: "Monitor 24 pulgadas",
      quantity: 2,
      condition: "prestado",
      location: "Aula 3",
      holder: "Comisión",
      projectId: null,
      createdAt: now,
    },
  ];

  const posts: Post[] = [
    {
      id: randomUUID(),
      kind: "aviso",
      title: "Reunión de comisión",
      body: "El jueves a las 18 en el laboratorio. Llevamos el presupuesto de la hackatón para cerrarlo antes de mandarlo.",
      pinned: true,
      authorId: presidencia,
      capacity: null,
      eventDate: "2026-10-02",
      signups: [],
      comments: [],
      createdAt: "2026-09-26T12:00:00.000Z",
    },
    {
      id: randomUUID(),
      kind: "convocatoria",
      title: "Taller de Git",
      body: "Busco gente para ayudar a dar el taller. No hace falta haber dado clase antes.",
      pinned: false,
      authorId: comision,
      capacity: 4,
      eventDate: "2026-10-08",
      signups: [miembro],
      comments: [
        {
          id: randomUUID(),
          authorId: miembro,
          body: "Puedo cubrir la parte de pull requests.",
          createdAt: "2026-09-26T19:00:00.000Z",
        },
      ],
      createdAt: "2026-09-24T12:00:00.000Z",
    },
  ];

  const events: CalEvent[] = [
    {
      id: randomUUID(),
      title: "Cierre de inscripción a talleres del cuatrimestre",
      date: "2026-10-20",
      kind: "limite",
      notes: "Fecha que pasó la facultad por mail.",
      createdAt: now,
    },
  ];

  return { members, ideas, projects, budgets, inventory, posts, events };
}

function normalize(input: Partial<DB>): DB {
  return {
    members: input.members ?? [],
    ideas: input.ideas ?? [],
    projects: input.projects ?? [],
    budgets: input.budgets ?? [],
    inventory: input.inventory ?? [],
    posts: input.posts ?? [],
    events: input.events ?? [],
  };
}

async function loadJson(): Promise<DB> {
  try {
    const raw = await readFile(file, "utf8");
    return normalize(JSON.parse(raw) as Partial<DB>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const db = seed();
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(db, null, 2));
    return db;
  }
}

async function saveJson(db: DB) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(db, null, 2));
}

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    role: row.role as Member["role"],
    career: String(row.career ?? ""),
    year: String(row.year ?? ""),
    status: row.status as Member["status"],
    joinedAt: String(row.joined_at),
  };
}

function mapIdea(row: Record<string, unknown>): Idea {
  return {
    id: String(row.id),
    title: String(row.title),
    body: String(row.body),
    tags: asStrings(row.tags),
    votes: asStrings(row.votes),
    authorId: String(row.author_id),
    status: row.status as Idea["status"],
    projectId: row.project_id ? String(row.project_id) : null,
    createdAt: String(row.created_at),
  };
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    name: String(row.name),
    summary: String(row.summary),
    status: row.status as Project["status"],
    ownerId: String(row.owner_id),
    ideaId: row.idea_id ? String(row.idea_id) : null,
    createdAt: String(row.created_at),
  };
}

function mapItem(row: unknown): BudgetItem {
  const item = row as BudgetItem;
  return {
    id: String(item.id),
    description: String(item.description ?? ""),
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    supplierUrl: String(item.supplierUrl ?? ""),
  };
}

function mapBudget(row: Record<string, unknown>): Budget {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    recipient: String(row.recipient),
    subject: String(row.subject),
    rationale: String(row.rationale),
    status: row.status as Budget["status"],
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : null,
    items: asArray(row.items, mapItem),
    createdAt: String(row.created_at),
  };
}

function mapInventory(row: Record<string, unknown>): InventoryItem {
  return {
    id: String(row.id),
    name: String(row.name),
    quantity: Number(row.quantity) || 0,
    condition: row.condition as InventoryItem["condition"],
    location: String(row.location ?? ""),
    holder: String(row.holder ?? ""),
    projectId: row.project_id ? String(row.project_id) : null,
    createdAt: String(row.created_at),
  };
}

function mapComment(row: unknown): Comment {
  const comment = row as Comment;
  return {
    id: String(comment.id),
    authorId: String(comment.authorId),
    body: String(comment.body ?? ""),
    createdAt: String(comment.createdAt),
  };
}

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    kind: row.kind as Post["kind"],
    title: String(row.title),
    body: String(row.body),
    pinned: Boolean(row.pinned),
    authorId: String(row.author_id),
    capacity: row.capacity == null ? null : Number(row.capacity),
    eventDate: row.event_date ? String(row.event_date).slice(0, 10) : null,
    signups: asStrings(row.signups),
    comments: asArray(row.comments, mapComment),
    createdAt: String(row.created_at),
  };
}

function mapEvent(row: Record<string, unknown>): CalEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    date: String(row.date).slice(0, 10),
    kind: row.kind as CalEvent["kind"],
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at),
  };
}

function schemaStale(message: string) {
  return /schema cache/i.test(message);
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQuery<T>(
  run: () => PromiseLike<{ data: T; error: { message: string } | null }>,
): Promise<T> {
  let message = "No se pudo hablar con la base.";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await run();
    if (!error) return data;
    message = error.message;
    if (!schemaStale(message) || attempt === 3) break;
    await pause(300 * (attempt + 1));
  }
  throw new Error(
    message.includes("does not exist")
      ? "Falta correr supabase/schema.sql."
      : message,
  );
}

async function selectAll(table: string) {
  const data = await runQuery(() => supabase().from(table).select("*"));
  return (data ?? []) as Record<string, unknown>[];
}

async function loadSupabase(): Promise<DB> {
  const [members, ideas, projects, budgets, inventory, posts, events] =
    await Promise.all([
      selectAll("members"),
      selectAll("ideas"),
      selectAll("projects"),
      selectAll("budgets"),
      selectAll("inventory_items"),
      selectAll("posts"),
      selectAll("events"),
    ]);
  return {
    members: members.map(mapMember),
    ideas: ideas.map(mapIdea),
    projects: projects.map(mapProject),
    budgets: budgets.map(mapBudget),
    inventory: inventory.map(mapInventory),
    posts: posts.map(mapPost),
    events: events.map(mapEvent),
  };
}

async function replaceTable(table: string, rows: Record<string, unknown>[]) {
  const client = supabase();
  const data = await runQuery(() => client.from(table).select("id"));
  const keep = new Set(rows.map((row) => String(row.id)));
  const remove = (data ?? [])
    .map((row) => String((row as { id: string }).id))
    .filter((id) => !keep.has(id));
  if (remove.length) {
    await runQuery(() => client.from(table).delete().in("id", remove).select("id"));
  }
  if (!rows.length) return;
  await runQuery(() => client.from(table).upsert(rows).select("id"));
}

async function saveSupabase(db: DB) {
  await replaceTable(
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
  await replaceTable(
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
  await replaceTable(
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
  await replaceTable(
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
  await replaceTable(
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
  await replaceTable(
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
  await replaceTable(
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
}

export async function load(): Promise<DB> {
  return locked(async () =>
    supabaseOn() ? loadSupabase() : loadJson(),
  );
}

export async function update(mutator: (db: DB) => void) {
  return locked(async () => {
    const db = supabaseOn() ? await loadSupabase() : await loadJson();
    mutator(db);
    if (supabaseOn()) await saveSupabase(db);
    else await saveJson(db);
    return db;
  });
}

export function usingSupabase() {
  return supabaseOn();
}
