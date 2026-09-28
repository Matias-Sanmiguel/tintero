import { load } from "@/server/db";
import { budgetTex, fileSlug } from "@/server/latex";
import { currentMember } from "@/server/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const member = await currentMember();
  if (!member) return new NextResponse("Tenés que entrar.", { status: 401 });
  const { id } = await context.params;
  const db = await load();
  const budget = db.budgets.find((item) => item.id === id);
  if (!budget) return new NextResponse("No está ese presupuesto.", { status: 404 });
  const project = db.projects.find((item) => item.id === budget.projectId);
  if (!project) return new NextResponse("Falta el proyecto.", { status: 404 });
  const owner = db.members.find((item) => item.id === project.ownerId);
  const tex = budgetTex({ budget, project, owner });
  return new NextResponse(tex, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${fileSlug(budget.title)}.tex"`,
    },
  });
}
