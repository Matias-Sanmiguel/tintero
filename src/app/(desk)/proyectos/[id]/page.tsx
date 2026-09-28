import Link from "next/link";
import { notFound } from "next/navigation";
import { FormSelect } from "@/components/form-select";
import { PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/Stamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
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
      <PageHeader
        kicker="Proyecto"
        title={project.name}
        description={project.summary || "Sin resumen."}
        action={budget ? <Stamp status={budget.status} /> : undefined}
      />
      <p className="text-sm text-muted-foreground">Responsable: {owner?.name ?? "sin asignar"}</p>
      {isStaff(member) ? (
        <form className="flex flex-wrap items-end gap-3" action={setProjectStatus}>
          <input type="hidden" name="id" value={project.id} />
          <Field className="w-full max-w-xs">
            <FieldLabel htmlFor="project-status">Estado</FieldLabel>
            <FormSelect
              id="project-status"
              name="status"
              defaultValue={project.status}
              options={statuses.map((status) => ({ value: status, label: projectStatusLabel[status] }))}
            />
          </Field>
          <Button type="submit">Guardar estado</Button>
        </form>
      ) : (
        <Badge variant="secondary">{projectStatusLabel[project.status]}</Badge>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          {budget ? (
            <Button variant="link" className="px-0" asChild>
              <Link href={`/presupuestos/${budget.id}`}>Abrir el documento en LaTeX</Link>
            </Button>
          ) : isStaff(member) ? (
            <form action={createBudget}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit">Armar presupuesto</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay presupuesto.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
