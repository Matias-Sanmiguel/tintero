import Link from "next/link";
import { notFound } from "next/navigation";
import { Stamp } from "@/components/Stamp";
import { createBudget, setProjectStatus } from "@/server/actions";
import { load } from "@/server/db";
import { projectStatusLabel } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff, type ProjectStatus } from "@/server/types";

const statuses: ProjectStatus[] = [
  "propuesto",
  "presupuesto",
  "aprobado",
  "en_curso",
  "pausado",
  "cerrado",
];

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await requireMember();
  const db = await load();
  const project = db.projects.find((item) => item.id === id);
  if (!project) notFound();
  const owner = db.members.find((item) => item.id === project.ownerId);
  const budget = db.budgets.find((item) => item.projectId === project.id);

  return (
    <>
      <p className="kicker">Proyecto</p>
      <div className="spread">
        <h1>{project.name}</h1>
        {budget ? <Stamp status={budget.status} /> : null}
      </div>
      <p className="lead">{project.summary || "Sin resumen."}</p>
      <p className="hint">Responsable: {owner?.name ?? "sin asignar"}</p>
      {isStaff(member) ? (
        <form className="inline section" action={setProjectStatus}>
          <input type="hidden" name="id" value={project.id} />
          <label>
            Estado
            <select name="status" defaultValue={project.status}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {projectStatusLabel[status]}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="submit">
            Guardar estado
          </button>
        </form>
      ) : (
        <p className="section">{projectStatusLabel[project.status]}</p>
      )}
      <section className="section sheet">
        <h2>Presupuesto</h2>
        {budget ? (
          <p>
            <Link href={`/presupuestos/${budget.id}`}>Abrir el documento en LaTeX</Link>
          </p>
        ) : isStaff(member) ? (
          <form action={createBudget}>
            <input type="hidden" name="projectId" value={project.id} />
            <button className="button" type="submit">
              Armar presupuesto
            </button>
          </form>
        ) : (
          <p>Todavía no hay presupuesto.</p>
        )}
      </section>
    </>
  );
}
