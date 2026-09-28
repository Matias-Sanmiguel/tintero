import Link from "next/link";
import { Notice } from "@/components/Notice";
import { createEvent, deleteEvent } from "@/server/actions";
import { load } from "@/server/db";
import { fecha, todayISO } from "@/server/format";
import { collectMarks } from "@/server/marks";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";

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
  const key = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const marks = collectMarks(db);
  const cells = monthCells(year, month);
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(cursor);
  const upcoming = marks.filter((mark) => mark.date >= todayISO(now));

  return (
    <>
      <p className="kicker">Fechas</p>
      <h1>Calendario</h1>
      <p className="lead">
        Límites para presentar presupuestos, días de convocatorias y lo que carga la comisión.
      </p>
      <Notice error={query.error} />
      <div className="spread">
        <h2 className="month-label">{label}</h2>
        <div className="inline">
          <Link className="button secondary" href={`/calendario?mes=${key(prev)}`}>
            Mes anterior
          </Link>
          <Link className="button secondary" href={`/calendario?mes=${key(next)}`}>
            Mes siguiente
          </Link>
        </div>
      </div>
      <div className="month section">
        {week.map((day) => (
          <div key={day} className="dow">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="day empty" />;
          const iso = `${key(cursor)}-${String(day).padStart(2, "0")}`;
          const dayMarks = marks.filter((mark) => mark.date === iso);
          return (
            <div key={iso} className={iso === todayISO(now) ? "day today" : "day"}>
              <b>{day}</b>
              {dayMarks.map((mark) => (
                <Link key={mark.id} href={mark.href} className={mark.kind === "limite" ? "limite" : undefined}>
                  {mark.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
      <section className="section">
        <h2>Por delante</h2>
        <div className="stack">
          {upcoming.map((mark) => (
            <div key={mark.id} className="spread sheet">
              <div>
                <p className="mono">{fecha(mark.date)}</p>
                <Link href={mark.href}>{mark.title}</Link>
              </div>
              {isStaff(member) && db.events.some((event) => event.id === mark.id) ? (
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={mark.id} />
                  <button className="button secondary" type="submit">
                    Quitar
                  </button>
                </form>
              ) : null}
            </div>
          ))}
          {upcoming.length === 0 ? <p className="hint">No queda nada fechado.</p> : null}
        </div>
      </section>
      {isStaff(member) ? (
        <form className="form sheet section" action={createEvent}>
          <h2>Cargar una fecha</h2>
          <label>
            Título
            <input name="title" required />
          </label>
          <div className="grid-2">
            <label>
              Día
              <input name="date" type="date" required />
            </label>
            <label>
              Tipo
              <select name="kind" defaultValue="evento">
                <option value="evento">Evento</option>
                <option value="limite">Fecha límite</option>
              </select>
            </label>
          </div>
          <label>
            Nota
            <input name="notes" />
          </label>
          <button className="button" type="submit">
            Agregar al calendario
          </button>
        </form>
      ) : null}
    </>
  );
}
