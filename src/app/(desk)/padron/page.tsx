import { FormSelect } from "@/components/form-select";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateMember, updateProfile } from "@/server/actions";
import { load } from "@/server/db";
import { memberStatusLabel, roleLabel, semesterStart } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff, type MemberStatus, type Role } from "@/server/types";

const roles: Role[] = ["miembro", "comision", "tesorero", "presidente"];
const statuses: MemberStatus[] = ["pendiente", "activo", "inactivo", "egresado"];

export default async function PadronPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const staff = isStaff(member);
  const start = semesterStart();
  const activos = db.members.filter((item) => item.status === "activo");
  const altas = activos.filter((item) => new Date(item.joinedAt) >= start);
  const roleOptions = roles.map((role) => ({ value: role, label: roleLabel[role] }));
  const statusOptions = statuses.map((status) => ({ value: status, label: memberStatusLabel[status] }));

  return (
    <>
      <PageHeader
        kicker="Gente"
        title="Padrón"
        action={
          staff ? (
            <Button variant="outline" asChild>
              <a href="/padron/export">Bajar CSV</a>
            </Button>
          ) : null
        }
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground ring-primary">
          <CardHeader>
            <CardTitle className="text-4xl text-primary-foreground">{activos.length}</CardTitle>
            <CardDescription className="text-primary-foreground/80">activos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{activos.filter((item) => isStaff(item)).length}</CardTitle>
            <CardDescription>comisión</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{altas.length}</CardTitle>
            <CardDescription>altas del cuatrimestre</CardDescription>
          </CardHeader>
        </Card>
      </section>
      <Notice error={query.error} />
      <Card>
        <CardHeader>
          <CardTitle>Mi ficha</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={updateProfile}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="me-name">Nombre</FieldLabel>
                  <Input id="me-name" name="name" defaultValue={member.name} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="me-year">Año</FieldLabel>
                  <Input id="me-year" name="year" defaultValue={member.year} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="me-career">Carrera</FieldLabel>
                <Input id="me-career" name="career" defaultValue={member.career} />
              </Field>
            </FieldGroup>
            <Button type="submit">Guardar mi ficha</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-(--card-spacing)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Mail</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                {staff ? <TableHead /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.members.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {row.career}
                    {row.year ? ` · ${row.year}` : ""}
                  </TableCell>
                  {staff && row.id !== member.id ? (
                    <TableCell colSpan={3}>
                      <form className="flex flex-wrap items-center gap-2" action={updateMember}>
                        <input type="hidden" name="id" value={row.id} />
                        {member.role === "presidente" ? (
                          <div className="w-36">
                            <FormSelect name="role" defaultValue={row.role} options={roleOptions} />
                          </div>
                        ) : (
                          <>
                            <span className="text-sm">{roleLabel[row.role]}</span>
                            <input type="hidden" name="role" value={row.role} />
                          </>
                        )}
                        <div className="w-36">
                          <FormSelect name="status" defaultValue={row.status} options={statusOptions} />
                        </div>
                        <Button type="submit">Guardar</Button>
                      </form>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>{roleLabel[row.role]}</TableCell>
                      <TableCell>{memberStatusLabel[row.status]}</TableCell>
                      {staff ? <TableCell className="text-muted-foreground">Tu ficha</TableCell> : null}
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
