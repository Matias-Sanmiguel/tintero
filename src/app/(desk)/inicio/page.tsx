import Link from "next/link";
import { Stamp } from "@/components/Stamp";
import { Notice } from "@/components/Notice";
import { load } from "@/server/db";
import {
  budgetStatusLabel,
  fecha,
  semesterStart,
  todayISO,
} from "@/server/format";
import { collectMarks } from "@/server/marks";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const start = semesterStart();
  const activos = db.members.filter((item) => item.status === "activo");
  const comision = activos.filter((item) => isStaff(item));
  const altas = activos.filter((item) => new Date(item.joinedAt) >= start);
  const marks = collectMarks(db).filter((mark) => mark.date >= todayISO());
  const next = marks[0];
  const budget = [...db.budgets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const pinned = db.posts.find((post) => post.pinned);
  const live = db.projects.filter((project) => project.status === "en_curso" || project.status === "aprobado");
  const calls = db.posts.filter((post) => post.kind === "convocatoria");

  return (
    <>
      <p className="kicker">IMAS+ · UADE</p>
      <h1>Mesa</h1>
      <p className="lead">
        {`${member.name}. Números del padrón, lo que está en marcha y el próximo papel.`}
      </p>
      <Notice error={query.error} />
      <section className="stats">
        <div className="stat">
          <b>{activos.length}</b>
          <span>miembros activos</span>
        </div>
        <div className="stat">
          <b>{comision.length}</b>
          <span>en la comisión</span>
        </div>
        <div className="stat">
          <b>{altas.length}</b>
          <span>altas del cuatrimestre</span>
        </div>
      </section>
      <div className="split">
        <div className="stack">
          <article className="sheet">
            <p className="kicker">Próxima fecha</p>
            {next ? (
              <>
                <h2>{fecha(next.date)}</h2>
                <p>
                  <Link href={next.href}>{next.title}</Link>
                </p>
              </>
            ) : (
              <p>No hay fechas por delante. El calendario las junta.</p>
            )}
          </article>
          {pinned ? (
            <article className="sheet">
              <p className="kicker">Aviso fijado</p>
              <h2>{pinned.title}</h2>
              <p>{pinned.body}</p>
            </article>
          ) : null}
          <section>
            <h2>En marcha</h2>
            {live.length === 0 ? (
              <p className="hint">Todavía no hay proyectos aprobados o en curso.</p>
            ) : (
              <div className="stack">
                {live.map((project) => (
                  <Link key={project.id} href={`/proyectos/${project.id}`} className="sheet">
                    {project.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="stack">
          <article className="sheet">
            <div className="spread">
              <p className="kicker">Último presupuesto</p>
              {budget ? <Stamp status={budget.status} /> : null}
            </div>
            {budget ? (
              <>
                <h2>{budget.title}</h2>
                <p className="hint">{budgetStatusLabel[budget.status]}</p>
                <p>
                  <Link href={`/presupuestos/${budget.id}`}>Abrir el documento</Link>
                </p>
              </>
            ) : (
              <p>Cuando un proyecto tenga presupuesto, el sello aparece acá.</p>
            )}
          </article>
          <section>
            <h2>Convocatorias</h2>
            <div className="stack">
              {calls.map((post) => {
                const spots =
                  post.capacity == null
                    ? `${post.signups.length} anotados`
                    : `${post.signups.length}/${post.capacity}`;
                return (
                  <Link key={post.id} href="/tablon" className="sheet">
                    <strong>{post.title}</strong>
                    <span className="hint"> {spots}</span>
                  </Link>
                );
              })}
              {calls.length === 0 ? <p className="hint">Nadie está buscando gente.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
