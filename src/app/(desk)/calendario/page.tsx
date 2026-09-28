import Link from "next/link";
import { FormSelect } from "@/components/form-select";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createEvent, deleteEvent } from "@/server/actions";
import { load } from "@/server/db";
import { fecha, todayISO } from "@/server/format";
import { collectMarks } from "@/server/marks";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";
import { cn } from "@/lib/utils";

const week = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const pad = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mes?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const now = new Date();
  const match = /^(\d{4})-(\d{2})$/.exec(query.mes ?? "");
  const year = match ? Number(match[1]) : now.getFullYear();
  const month = match ? Number(match[2]) - 1 : now.getMonth();
  const cursor = new Date(year, month, 1);
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const marks = collectMarks(db);
  const cells = monthCells(year, month);
  const label = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(cursor);
  const upcoming = marks.filter((mark) => mark.date >= todayISO(now));

  return (
    <>
      <PageHeader
        kicker="Fechas"
        title="Calendario"
        description="Límites para presentar presupuestos, días de convocatorias y lo que carga la comisión."
      />
      <Notice error={query.error} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold capitalize">{label}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/calendario?mes=${key(prev)}`}>Mes anterior</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/calendario?mes=${key(next)}`}>Mes siguiente</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {week.map((day) => (
          <div key={day} className="px-1 text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="min-h-16 rounded-lg md:min-h-24" />;
          const iso = `${key(cursor)}-${String(day).padStart(2, "0")}`;
          const dayMarks = marks.filter((mark) => mark.date === iso);
          const today = iso === todayISO(now);
          return (
            <div
              key={iso}
              className={cn(
                "flex min-h-16 flex-col gap-1 rounded-lg border bg-card p-1.5 text-xs md:min-h-24",
                today && "border-primary bg-accent/40",
              )}
            >
              <span className={cn("font-medium", today && "text-primary")}>{day}</span>
              {dayMarks.map((mark) => (
                <Link
                  key={mark.id}
                  href={mark.href}
                  className={cn("truncate hover:underline", mark.kind === "limite" ? "font-medium text-primary" : "text-foreground")}
                >
                  {mark.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Por delante</h2>
        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-2 pr-3">
            {upcoming.map((mark) => (
              <Card key={mark.id} size="sm">
                <CardContent className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{fecha(mark.date)}</p>
                    <Link href={mark.href} className="font-medium text-primary underline-offset-4 hover:underline">
                      {mark.title}
                    </Link>
                  </div>
                  {isStaff(member) && db.events.some((event) => event.id === mark.id) ? (
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={mark.id} />
                      <Button variant="outline" size="sm" type="submit">
                        Quitar
                      </Button>
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            ))}
            {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No queda nada fechado.</p> : null}
          </div>
        </ScrollArea>
      </section>
      {isStaff(member) ? (
        <Card>
          <CardHeader>
            <CardTitle>Cargar una fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" action={createEvent}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="event-title">Título</FieldLabel>
                  <Input id="event-title" name="title" required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="event-date">Día</FieldLabel>
                    <Input id="event-date" name="date" type="date" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="event-kind">Tipo</FieldLabel>
                    <FormSelect
                      id="event-kind"
                      name="kind"
                      defaultValue="evento"
                      options={[
                        { value: "evento", label: "Evento" },
                        { value: "limite", label: "Fecha límite" },
                      ]}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="event-notes">Nota</FieldLabel>
                  <Input id="event-notes" name="notes" />
                </Field>
              </FieldGroup>
              <Button type="submit">Agregar al calendario</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
