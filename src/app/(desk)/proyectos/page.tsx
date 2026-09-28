import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/Notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
      <PageHeader
        kicker="Trabajo"
        title="Proyectos"
        description="Lo que el club decidió hacer, desde la propuesta hasta el cierre."
      />
      <Notice error={query.error} />
      <Card>
        <CardContent className="pt-(--card-spacing)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/proyectos/${project.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{projectStatusLabel[project.status]}</Badge>
                  </TableCell>
                  <TableCell>{names.get(project.ownerId) ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isStaff(member) ? (
        <Card>
          <CardHeader>
            <CardTitle>Abrir un proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" action={createProject}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-name">Nombre</FieldLabel>
                  <Input id="project-name" name="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-summary">Resumen</FieldLabel>
                  <Textarea id="project-summary" name="summary" />
                </Field>
              </FieldGroup>
              <Button type="submit">Crear proyecto</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
