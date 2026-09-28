"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { load, update } from "./db";
import { pesosInput, text, whole } from "./format";
import { DUMMY_HASH, hashPassword, verifyPassword } from "./password";
import { clearSession, requireMember, requireStaff, setSession } from "./session";
import { isStaff, type DB } from "./types";

function refresh() {
  revalidatePath("/", "layout");
}

async function commit(mutator: (db: DB) => void) {
  try {
    await update(mutator);
  } catch (error) {
    console.error(error);
    const headerList = await headers();
    const referer = headerList.get("referer");
    let path = "/inicio";
    if (referer) {
      try {
        path = new URL(referer).pathname;
      } catch {
        path = "/inicio";
      }
    }
    redirect(`${path}?error=guardar`);
  }
}

function emailOf(value: FormDataEntryValue | null) {
  return text(value).toLowerCase();
}

export async function login(formData: FormData) {
  const email = emailOf(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const db = await load();
  const member = db.members.find((item) => item.email === email);
  const ok = verifyPassword(password, member?.passwordHash ?? DUMMY_HASH);
  if (!member || !ok) {
    redirect("/login?error=credenciales");
  }
  if (member.status !== "activo") {
    redirect("/login?error=estado");
  }
  await setSession(member.id);
  redirect("/inicio");
}

export async function register(formData: FormData) {
  const name = text(formData.get("name"));
  const email = emailOf(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const career = text(formData.get("career"));
  const year = text(formData.get("year"));
  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    redirect("/login?error=registro");
  }
  let created = false;
  let taken = false;
  let wasFirst = false;
  await commit((db) => {
    if (db.members.some((item) => item.email === email)) {
      taken = true;
      return;
    }
    const first = db.members.length === 0;
    wasFirst = first;
    db.members.push({
      id: randomUUID(),
      email,
      name,
      passwordHash: hashPassword(password),
      role: first ? "presidente" : "miembro",
      career,
      year,
      status: first ? "activo" : "pendiente",
      joinedAt: new Date().toISOString(),
    });
    created = true;
  });
  if (taken) redirect("/login?error=existe");
  if (!created) redirect("/login?error=registro");
  redirect(wasFirst ? "/login?ok=listo" : "/login?ok=pendiente");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function createIdea(formData: FormData) {
  const member = await requireMember();
  const title = text(formData.get("title"));
  const body = text(formData.get("body"));
  const tags = text(formData.get("tags"))
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
  if (title.length < 3 || body.length < 3) redirect("/tintero?error=idea");
  await commit((db) => {
    db.ideas.push({
      id: randomUUID(),
      title,
      body,
      tags,
      votes: [],
      authorId: member.id,
      status: "abierta",
      projectId: null,
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
  redirect("/tintero");
}

export async function voteIdea(formData: FormData) {
  const member = await requireMember();
  const ideaId = text(formData.get("ideaId"));
  await commit((db) => {
    const idea = db.ideas.find((item) => item.id === ideaId);
    if (!idea || idea.status === "archivada") return;
    idea.votes = idea.votes.includes(member.id)
      ? idea.votes.filter((id) => id !== member.id)
      : [...idea.votes, member.id];
  });
  refresh();
}

export async function archiveIdea(formData: FormData) {
  const member = await requireMember();
  const ideaId = text(formData.get("ideaId"));
  await commit((db) => {
    const idea = db.ideas.find((item) => item.id === ideaId);
    if (!idea || idea.status === "promovida") return;
    if (idea.authorId !== member.id && !isStaff(member)) return;
    idea.status = "archivada";
  });
  refresh();
}

export async function promoteIdea(formData: FormData) {
  const member = await requireStaff();
  const ideaId = text(formData.get("ideaId"));
  let projectId = "";
  await commit((db) => {
    const idea = db.ideas.find((item) => item.id === ideaId);
    if (!idea || idea.status === "promovida") return;
    projectId = randomUUID();
    db.projects.push({
      id: projectId,
      name: idea.title,
      summary: idea.body,
      status: "propuesto",
      ownerId: member.id,
      ideaId: idea.id,
      createdAt: new Date().toISOString(),
    });
    idea.status = "promovida";
    idea.projectId = projectId;
  });
  refresh();
  if (projectId) redirect(`/proyectos/${projectId}`);
  redirect("/tintero");
}

export async function createProject(formData: FormData) {
  const member = await requireStaff();
  const name = text(formData.get("name"));
  const summary = text(formData.get("summary"));
  if (name.length < 3) redirect("/proyectos?error=nombre");
  const id = randomUUID();
  await commit((db) => {
    db.projects.push({
      id,
      name,
      summary,
      status: "propuesto",
      ownerId: member.id,
      ideaId: null,
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
  redirect(`/proyectos/${id}`);
}

export async function setProjectStatus(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  const status = text(formData.get("status"));
  const allowed = [
    "propuesto",
    "presupuesto",
    "aprobado",
    "en_curso",
    "pausado",
    "cerrado",
  ];
  if (!allowed.includes(status)) redirect(`/proyectos/${id}`);
  await commit((db) => {
    const project = db.projects.find((item) => item.id === id);
    if (project) project.status = status as typeof project.status;
  });
  refresh();
  redirect(`/proyectos/${id}`);
}

export async function createBudget(formData: FormData) {
  await requireStaff();
  const projectId = text(formData.get("projectId"));
  let budgetId = "";
  await commit((db) => {
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) return;
    if (db.budgets.some((item) => item.projectId === projectId)) return;
    budgetId = randomUUID();
    db.budgets.push({
      id: budgetId,
      projectId,
      title: project.name,
      recipient: "Secretaría de la facultad",
      subject: `Pedido de fondos para ${project.name}`,
      rationale: project.summary,
      status: "borrador",
      dueDate: null,
      items: [],
      createdAt: new Date().toISOString(),
    });
    if (project.status === "propuesto") project.status = "presupuesto";
  });
  refresh();
  if (budgetId) redirect(`/presupuestos/${budgetId}`);
  redirect(`/proyectos/${projectId}`);
}

export async function updateBudget(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  const due = text(formData.get("dueDate"));
  await commit((db) => {
    const budget = db.budgets.find((item) => item.id === id);
    if (!budget) return;
    budget.title = text(formData.get("title")) || budget.title;
    budget.recipient = text(formData.get("recipient")) || budget.recipient;
    budget.subject = text(formData.get("subject")) || budget.subject;
    budget.rationale = text(formData.get("rationale"));
    budget.dueDate = due || null;
    const status = text(formData.get("status"));
    if (
      status === "borrador" ||
      status === "enviado" ||
      status === "observado" ||
      status === "aprobado" ||
      status === "rechazado"
    ) {
      budget.status = status;
    }
  });
  refresh();
  redirect(`/presupuestos/${id}`);
}

export async function addBudgetItem(formData: FormData) {
  await requireStaff();
  const budgetId = text(formData.get("budgetId"));
  const description = text(formData.get("description"));
  const quantity = Math.max(1, whole(formData.get("quantity"), 1));
  const unitPrice = pesosInput(formData.get("unitPrice"));
  const supplierUrl = text(formData.get("supplierUrl"));
  if (description.length < 2) redirect(`/presupuestos/${budgetId}?error=item`);
  await commit((db) => {
    const budget = db.budgets.find((item) => item.id === budgetId);
    if (!budget) return;
    budget.items.push({
      id: randomUUID(),
      description,
      quantity,
      unitPrice,
      supplierUrl,
    });
  });
  refresh();
  redirect(`/presupuestos/${budgetId}`);
}

export async function deleteBudgetItem(formData: FormData) {
  await requireStaff();
  const budgetId = text(formData.get("budgetId"));
  const itemId = text(formData.get("itemId"));
  await commit((db) => {
    const budget = db.budgets.find((item) => item.id === budgetId);
    if (!budget) return;
    budget.items = budget.items.filter((item) => item.id !== itemId);
  });
  refresh();
  redirect(`/presupuestos/${budgetId}`);
}

export async function createInventory(formData: FormData) {
  await requireStaff();
  const name = text(formData.get("name"));
  if (name.length < 2) redirect("/inventario?error=nombre");
  const condition = text(formData.get("condition"));
  await commit((db) => {
    db.inventory.push({
      id: randomUUID(),
      name,
      quantity: Math.max(1, whole(formData.get("quantity"), 1)),
      condition:
        condition === "prestado" || condition === "roto"
          ? condition
          : "disponible",
      location: text(formData.get("location")),
      holder: text(formData.get("holder")),
      projectId: text(formData.get("projectId")) || null,
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
  redirect("/inventario");
}

export async function updateInventory(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  const condition = text(formData.get("condition"));
  await commit((db) => {
    const item = db.inventory.find((row) => row.id === id);
    if (!item) return;
    item.quantity = Math.max(0, whole(formData.get("quantity"), item.quantity));
    item.condition =
      condition === "prestado" || condition === "roto" || condition === "disponible"
        ? condition
        : item.condition;
    item.location = text(formData.get("location"));
    item.holder = text(formData.get("holder"));
    item.projectId = text(formData.get("projectId")) || null;
  });
  refresh();
  redirect("/inventario");
}

export async function deleteInventory(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  await commit((db) => {
    db.inventory = db.inventory.filter((item) => item.id !== id);
  });
  refresh();
  redirect("/inventario");
}

export async function updateProfile(formData: FormData) {
  const member = await requireMember();
  const name = text(formData.get("name"));
  if (name.length < 2) redirect("/padron?error=nombre");
  await commit((db) => {
    const row = db.members.find((item) => item.id === member.id);
    if (!row) return;
    row.name = name;
    row.career = text(formData.get("career"));
    row.year = text(formData.get("year"));
  });
  refresh();
  redirect("/padron");
}

export async function updateMember(formData: FormData) {
  const actor = await requireStaff();
  const id = text(formData.get("id"));
  const role = text(formData.get("role"));
  const status = text(formData.get("status"));
  await commit((db) => {
    const row = db.members.find((item) => item.id === id);
    if (!row || row.id === actor.id) return;
    if (
      actor.role === "presidente" &&
      (role === "miembro" ||
        role === "comision" ||
        role === "tesorero" ||
        role === "presidente")
    ) {
      row.role = role;
    }
    if (
      status === "pendiente" ||
      status === "activo" ||
      status === "inactivo" ||
      status === "egresado"
    ) {
      row.status = status;
    }
  });
  refresh();
  redirect("/padron");
}

export async function createPost(formData: FormData) {
  const member = await requireMember();
  const kind = text(formData.get("kind")) === "convocatoria" ? "convocatoria" : "aviso";
  if (kind === "aviso" && !isStaff(member)) redirect("/tablon?error=permiso");
  const title = text(formData.get("title"));
  const body = text(formData.get("body"));
  if (title.length < 3 || body.length < 3) redirect("/tablon?error=post");
  const capacityRaw = text(formData.get("capacity"));
  const capacity = capacityRaw ? Math.max(1, whole(formData.get("capacity"), 1)) : null;
  const eventDate = text(formData.get("eventDate")) || null;
  await commit((db) => {
    db.posts.push({
      id: randomUUID(),
      kind,
      title,
      body,
      pinned: false,
      authorId: member.id,
      capacity: kind === "convocatoria" ? capacity : null,
      eventDate,
      signups: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
  redirect("/tablon");
}

export async function togglePin(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  await commit((db) => {
    const post = db.posts.find((item) => item.id === id);
    if (post) post.pinned = !post.pinned;
  });
  refresh();
}

export async function toggleSignup(formData: FormData) {
  const member = await requireMember();
  const id = text(formData.get("id"));
  await commit((db) => {
    const post = db.posts.find((item) => item.id === id);
    if (!post || post.kind !== "convocatoria") return;
    if (post.signups.includes(member.id)) {
      post.signups = post.signups.filter((item) => item !== member.id);
      return;
    }
    if (post.capacity != null && post.signups.length >= post.capacity) return;
    post.signups.push(member.id);
  });
  refresh();
}

export async function addComment(formData: FormData) {
  const member = await requireMember();
  const id = text(formData.get("id"));
  const body = text(formData.get("body")).slice(0, 500);
  if (body.length < 1) return;
  await commit((db) => {
    const post = db.posts.find((item) => item.id === id);
    if (!post) return;
    post.comments.push({
      id: randomUUID(),
      authorId: member.id,
      body,
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
}

export async function createEvent(formData: FormData) {
  await requireStaff();
  const title = text(formData.get("title"));
  const date = text(formData.get("date"));
  if (title.length < 3 || !date) redirect("/calendario?error=evento");
  const kind = text(formData.get("kind")) === "limite" ? "limite" : "evento";
  await commit((db) => {
    db.events.push({
      id: randomUUID(),
      title,
      date,
      kind,
      notes: text(formData.get("notes")),
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
  redirect("/calendario");
}

export async function deleteEvent(formData: FormData) {
  await requireStaff();
  const id = text(formData.get("id"));
  await commit((db) => {
    db.events = db.events.filter((event) => event.id !== id);
  });
  refresh();
  redirect("/calendario");
}
