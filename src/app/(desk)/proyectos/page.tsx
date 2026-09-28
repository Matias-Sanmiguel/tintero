import Link from "next/link";
import { Notice } from "@/components/Notice";
import { createProject } from "@/server/actions";
import { load } from "@/server/db";
import { projectStatusLabel } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const names = new Map(db.members.map((item) => [item.id, item.name]));

  return (
    <>
      <p className="kicker">Trabajo</p>
      <h1>Proyectos</h1>
      <p className="lead">Lo que el club decidió hacer, desde la propuesta hasta el cierre.</p>
      <Notice error={query.error} />
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Estado</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {db.projects.map((project) => (
            <tr key={project.id}>
              <td>
                <Link href={`/proyectos/${project.id}`}>{project.name}</Link>
              </td>
              <td>{projectStatusLabel[project.status]}</td>
              <td>{names.get(project.ownerId) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isStaff(member) ? (
        <form className="form sheet section" action={createProject}>
          <h2>Abrir un proyecto</h2>
          <label>
            Nombre
            <input name="name" required />
          </label>
          <label>
            Resumen
            <textarea name="summary" />
          </label>
          <button className="button" type="submit">
            Crear proyecto
          </button>
        </form>
      ) : null}
    </>
  );
}
