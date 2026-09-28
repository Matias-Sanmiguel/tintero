import Link from "next/link";
import { notFound } from "next/navigation";
import { FormSelect } from "@/components/form-select";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/page-header";
import { Stamp } from "@/components/Stamp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { addBudgetItem, deleteBudgetItem, updateBudget } from "@/server/actions";
import { load } from "@/server/db";
import { budgetStatusLabel, budgetTotal, pesos } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff, type BudgetStatus } from "@/server/types";

const statuses: BudgetStatus[] = ["borrador", "enviado", "observado", "aprobado", "rechazado"];

export default async function PresupuestoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const budget = db.budgets.find((item) => item.id === id);
  if (!budget) notFound();
  const project = db.projects.find((item) => item.id === budget.projectId);
  const staff = isStaff(member);

  return (
    <>
      <PageHeader
        kicker="Documento"
        title={budget.title}
        description={
          <>
            {project ? (
              <Link href={`/proyectos/${project.id}`} className="text-primary underline-offset-4 hover:underline">
                {project.name}
              </Link>
            ) : (
              "Proyecto"
            )}
            {". La fuente es LaTeX. El PDF se compila con pdflatex en el servidor."}
          </>
        }
        action={<Stamp status={budget.status} />}
      />
      <Notice error={query.error} />
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={`/presupuestos/${budget.id}/pdf`}>Bajar PDF</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`/presupuestos/${budget.id}/tex`}>Bajar .tex</a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Total {pesos(budgetTotal(budget.items))}</p>
      <Card>
        <CardContent className="pt-(--card-spacing)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {budget.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.description}
                    {item.supplierUrl ? (
                      <>
                        <br />
                        <a href={item.supplierUrl} className="text-primary underline-offset-4 hover:underline">
                          {item.supplierUrl}
                        </a>
                      </>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{pesos(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{pesos(item.quantity * item.unitPrice)}</TableCell>
                  <TableCell>
                    {staff ? (
                      <form action={deleteBudgetItem}>
                        <input type="hidden" name="budgetId" value={budget.id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button variant="outline" size="sm" type="submit">
                          Quitar
                        </Button>
                      </form>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {staff ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Agregar ítem</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" action={addBudgetItem}>
                <input type="hidden" name="budgetId" value={budget.id} />
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="item-desc">Descripción</FieldLabel>
                    <Input id="item-desc" name="description" required />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="item-qty">Cantidad</FieldLabel>
                      <Input id="item-qty" name="quantity" type="number" min={1} defaultValue={1} required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="item-price">Precio unitario, en pesos</FieldLabel>
                      <Input id="item-price" name="unitPrice" inputMode="numeric" required placeholder="31000" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="item-url">Link del proveedor</FieldLabel>
                    <Input id="item-url" name="supplierUrl" type="url" placeholder="https://" />
                  </Field>
                </FieldGroup>
                <Button type="submit">Agregar ítem</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Datos del documento</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" action={updateBudget}>
                <input type="hidden" name="id" value={budget.id} />
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="budget-title">Título</FieldLabel>
                    <Input id="budget-title" name="title" defaultValue={budget.title} required />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="budget-recipient">Destinatario</FieldLabel>
                      <Input id="budget-recipient" name="recipient" defaultValue={budget.recipient} required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="budget-status">Estado</FieldLabel>
                      <FormSelect
                        id="budget-status"
                        name="status"
                        defaultValue={budget.status}
                        options={statuses.map((status) => ({ value: status, label: budgetStatusLabel[status] }))}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="budget-subject">Asunto</FieldLabel>
                    <Input id="budget-subject" name="subject" defaultValue={budget.subject} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="budget-rationale">Fundamento</FieldLabel>
                    <Textarea id="budget-rationale" name="rationale" defaultValue={budget.rationale} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="budget-due">Fecha límite para presentarlo</FieldLabel>
                    <Input id="budget-due" name="dueDate" type="date" defaultValue={budget.dueDate ?? ""} />
                  </Field>
                </FieldGroup>
                <Button type="submit">Guardar documento</Button>
              </form>
            </CardContent>
          </Card>
        </>
      ) : null}
    </>
  );
}
