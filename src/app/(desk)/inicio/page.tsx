import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/Notice";
import { Stamp } from "@/components/Stamp";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { load } from "@/server/db";
import { budgetStatusLabel, fecha, semesterStart, todayISO } from "@/server/format";
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
      <PageHeader
        kicker="IMAS+ · UADE"
        title="Mesa"
        description={`${member.name}. Números del padrón, lo que está en marcha y el próximo papel.`}
      />
      <Notice error={query.error} />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground ring-primary">
          <CardHeader>
            <CardTitle className="text-4xl text-primary-foreground">{activos.length}</CardTitle>
            <CardDescription className="text-primary-foreground/80">miembros activos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{comision.length}</CardTitle>
            <CardDescription>en la comisión</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{altas.length}</CardTitle>
            <CardDescription>altas del cuatrimestre</CardDescription>
          </CardHeader>
        </Card>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Próxima fecha
              </CardDescription>
              {next ? (
                <>
                  <CardTitle>{fecha(next.date)}</CardTitle>
                  <CardDescription>
                    <Link href={next.href} className="text-primary underline-offset-4 hover:underline">
                      {next.title}
                    </Link>
                  </CardDescription>
                </>
              ) : (
                <CardDescription>No hay fechas por delante. El calendario las junta.</CardDescription>
              )}
            </CardHeader>
          </Card>
          {pinned ? (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                  Aviso fijado
                </CardDescription>
                <CardTitle>{pinned.title}</CardTitle>
                <CardDescription>{pinned.body}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">En marcha</h2>
            {live.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay proyectos aprobados o en curso.</p>
            ) : (
              live.map((project) => (
                <Link key={project.id} href={`/proyectos/${project.id}`}>
                  <Card className="transition-colors hover:bg-muted/60">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </section>
        </div>
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardDescription className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                  Último presupuesto
                </CardDescription>
                {budget ? <Stamp status={budget.status} /> : null}
              </div>
              {budget ? (
                <>
                  <CardTitle>{budget.title}</CardTitle>
                  <CardDescription>{budgetStatusLabel[budget.status]}</CardDescription>
                </>
              ) : (
                <CardDescription>Cuando un proyecto tenga presupuesto, el sello aparece acá.</CardDescription>
              )}
            </CardHeader>
            {budget ? (
              <CardContent>
                <Link href={`/presupuestos/${budget.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Abrir el documento
                </Link>
              </CardContent>
            ) : null}
          </Card>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Convocatorias</h2>
            {calls.map((post) => {
              const spots =
                post.capacity == null ? `${post.signups.length} anotados` : `${post.signups.length}/${post.capacity}`;
              return (
                <Link key={post.id} href="/tablon">
                  <Card className="transition-colors hover:bg-muted/60">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-3">
                        {post.title}
                        <Badge variant="secondary">{spots}</Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
            {calls.length === 0 ? <p className="text-sm text-muted-foreground">Nadie está buscando gente.</p> : null}
          </section>
        </div>
      </div>
    </>
  );
}
