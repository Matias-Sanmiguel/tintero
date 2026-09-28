export type Role = "miembro" | "comision" | "tesorero" | "presidente";

export type MemberStatus = "pendiente" | "activo" | "inactivo" | "egresado";

export type Member = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  career: string;
  year: string;
  status: MemberStatus;
  joinedAt: string;
};

export type PublicMember = Omit<Member, "passwordHash">;

export type IdeaStatus = "abierta" | "promovida" | "archivada";

export type Idea = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  votes: string[];
  authorId: string;
  status: IdeaStatus;
  projectId: string | null;
  createdAt: string;
};

export type ProjectStatus =
  | "propuesto"
  | "presupuesto"
  | "aprobado"
  | "en_curso"
  | "pausado"
  | "cerrado";

export type Project = {
  id: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  ownerId: string;
  ideaId: string | null;
  createdAt: string;
};

export type BudgetStatus =
  | "borrador"
  | "enviado"
  | "observado"
  | "aprobado"
  | "rechazado";

export type BudgetItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  supplierUrl: string;
};

export type Budget = {
  id: string;
  projectId: string;
  title: string;
  recipient: string;
  subject: string;
  rationale: string;
  status: BudgetStatus;
  dueDate: string | null;
  items: BudgetItem[];
  createdAt: string;
};

export type ItemCondition = "disponible" | "prestado" | "roto";

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  condition: ItemCondition;
  location: string;
  holder: string;
  projectId: string | null;
  createdAt: string;
};

export type Comment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
};

export type Post = {
  id: string;
  kind: "aviso" | "convocatoria";
  title: string;
  body: string;
  pinned: boolean;
  authorId: string;
  capacity: number | null;
  eventDate: string | null;
  signups: string[];
  comments: Comment[];
  createdAt: string;
};

export type CalEvent = {
  id: string;
  title: string;
  date: string;
  kind: "limite" | "evento";
  notes: string;
  createdAt: string;
};

export type DB = {
  members: Member[];
  ideas: Idea[];
  projects: Project[];
  budgets: Budget[];
  inventory: InventoryItem[];
  posts: Post[];
  events: CalEvent[];
};

export function isStaff(member: { role: Role }) {
  return (
    member.role === "comision" ||
    member.role === "tesorero" ||
    member.role === "presidente"
  );
}

export function publicMember(member: Member): PublicMember {
  const { passwordHash: _passwordHash, ...pub } = member;
  return pub;
}
