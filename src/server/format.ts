import type {
  BudgetStatus,
  ItemCondition,
  MemberStatus,
  ProjectStatus,
  Role,
} from "./types";

export function pesos(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/[\u00a0\u202f]/g, " ");
}

export function fecha(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function fechaCorta(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function semesterStart(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) return new Date(year, 7, 1);
  if (month >= 2) return new Date(year, 2, 1);
  return new Date(year - 1, 7, 1);
}

export function pesosInput(value: FormDataEntryValue | null) {
  let raw = String(value ?? "")
    .trim()
    .replace(/\$/g, "")
    .replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+$/.test(raw)) raw = raw.replace(/\./g, "");
  raw = raw.replace(",", ".");
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export function whole(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(String(value ?? "").trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.round(n);
}

export function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export const roleLabel: Record<Role, string> = {
  miembro: "Miembro",
  comision: "Comisión",
  tesorero: "Tesorero",
  presidente: "Presidencia",
};

export const memberStatusLabel: Record<MemberStatus, string> = {
  pendiente: "Pendiente",
  activo: "Activo",
  inactivo: "Inactivo",
  egresado: "Egresado",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  propuesto: "Propuesto",
  presupuesto: "Con presupuesto",
  aprobado: "Aprobado",
  en_curso: "En curso",
  pausado: "Pausado",
  cerrado: "Cerrado",
};

export const budgetStatusLabel: Record<BudgetStatus, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  observado: "Observado",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

export const conditionLabel: Record<ItemCondition, string> = {
  disponible: "Disponible",
  prestado: "Prestado",
  roto: "Roto",
};

export function budgetTotal(items: { quantity: number; unitPrice: number }[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
