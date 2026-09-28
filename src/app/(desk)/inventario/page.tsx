import { FormSelect } from "@/components/form-select";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createInventory, deleteInventory, updateInventory } from "@/server/actions";
import { load } from "@/server/db";
import { conditionLabel } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff, type ItemCondition } from "@/server/types";

const conditions: ItemCondition[] = ["disponible", "prestado", "roto"];

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const staff = isStaff(member);
  const conditionOptions = conditions.map((condition) => ({
    value: condition,
    label: conditionLabel[condition],
  }));

  return (
    <>
      <PageHeader
        kicker="Cosas del club"
        title="Inventario"
        description="Qué hay, cuántos, en qué estado y dónde está. El préstamo con fecha de devolución queda para después: hoy se anota quién lo tiene."
      />
      <Notice error={query.error} />
      <div className="flex flex-col gap-3">
        {db.inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{item.name}</CardTitle>
                <Badge variant="secondary">{conditionLabel[item.condition]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" action={updateInventory}>
                <input type="hidden" name="id" value={item.id} />
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`qty-${item.id}`}>Cantidad</FieldLabel>
                      <Input
                        id={`qty-${item.id}`}
                        name="quantity"
                        type="number"
                        min={0}
                        defaultValue={item.quantity}
                        disabled={!staff}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`cond-${item.id}`}>Estado</FieldLabel>
                      <FormSelect
                        id={`cond-${item.id}`}
                        name="condition"
                        defaultValue={item.condition}
                        options={conditionOptions}
                        disabled={!staff}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`loc-${item.id}`}>Dónde está</FieldLabel>
                      <Input id={`loc-${item.id}`} name="location" defaultValue={item.location} disabled={!staff} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`hold-${item.id}`}>Quién lo tiene</FieldLabel>
                      <Input id={`hold-${item.id}`} name="holder" defaultValue={item.holder} disabled={!staff} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`proj-${item.id}`}>Proyecto de origen</FieldLabel>
                    <FormSelect
                      id={`proj-${item.id}`}
                      name="projectId"
                      defaultValue={item.projectId ?? ""}
                      disabled={!staff}
                      options={[
                        { value: "__none__", label: "Ninguno" },
                        ...db.projects.map((project) => ({ value: project.id, label: project.name })),
                      ]}
                    />
                  </Field>
                </FieldGroup>
                {staff ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">Guardar</Button>
                    <Button variant="outline" type="submit" formAction={deleteInventory}>
                      Quitar
                    </Button>
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
      {staff ? (
        <Card>
          <CardHeader>
            <CardTitle>Sumar algo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" action={createInventory}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="inv-name">Nombre</FieldLabel>
                  <Input id="inv-name" name="name" required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="inv-qty">Cantidad</FieldLabel>
                    <Input id="inv-qty" name="quantity" type="number" min={1} defaultValue={1} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="inv-cond">Estado</FieldLabel>
                    <FormSelect
                      id="inv-cond"
                      name="condition"
                      defaultValue="disponible"
                      options={conditionOptions}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="inv-loc">Dónde está</FieldLabel>
                    <Input id="inv-loc" name="location" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="inv-hold">Quién lo tiene</FieldLabel>
                    <Input id="inv-hold" name="holder" />
                  </Field>
                </div>
              </FieldGroup>
              <Button type="submit">Agregar al inventario</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
