import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/Notice";
import { Stamp } from "@/components/Stamp";
import { addBudgetItem, deleteBudgetItem, updateBudget } from "@/server/actions";
import { load } from "@/server/db";
import { budgetStatusLabel, budgetTotal, pesos } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff, type BudgetStatus } from "@/server/types";

const statuses: BudgetStatus[] = [
  "borrador",
  "enviado",
  "observado",
  "aprobado",
  "rechazado",
];

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
      <p className="kicker">Documento</p>
      <div className="spread">
        <h1>{budget.title}</h1>
        <Stamp status={budget.status} />
      </div>
      <p className="lead">
        {project ? <Link href={`/proyectos/${project.id}`}>{project.name}</Link> : "Proyecto"}
        {". La fuente es LaTeX. El PDF se compila con pdflatex en el servidor."}
      </p>
      <Notice error={query.error} />
      <div className="inline">
        <a className="button" href={`/presupuestos/${budget.id}/pdf`}>
          Bajar PDF
        </a>
        <a className="button secondary" href={`/presupuestos/${budget.id}/tex`}>
          Bajar .tex
        </a>
      </div>
      <p className="hint section">Total {pesos(budgetTotal(budget.items))}</p>
      <table className="section">
        <thead>
          <tr>
            <th>Descripción</th>
            <th className="num">Cant.</th>
            <th className="num">Unitario</th>
            <th className="num">Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {budget.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.description}
                {item.supplierUrl ? (
                  <>
                    <br />
                    <a href={item.supplierUrl}>{item.supplierUrl}</a>
                  </>
                ) : null}
              </td>
              <td className="num">{item.quantity}</td>
              <td className="num">{pesos(item.unitPrice)}</td>
              <td className="num">{pesos(item.quantity * item.unitPrice)}</td>
              <td>
                {staff ? (
                  <form action={deleteBudgetItem}>
                    <input type="hidden" name="budgetId" value={budget.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="button secondary" type="submit">
                      Quitar
                    </button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {staff ? (
        <>
          <form className="form sheet section" action={addBudgetItem}>
            <h2>Agregar ítem</h2>
            <input type="hidden" name="budgetId" value={budget.id} />
            <label>
              Descripción
              <input name="description" required />
            </label>
            <div className="grid-2">
              <label>
                Cantidad
                <input name="quantity" type="number" min={1} defaultValue={1} required />
              </label>
              <label>
                Precio unitario, en pesos
                <input name="unitPrice" inputMode="numeric" required placeholder="31000" />
              </label>
            </div>
            <label>
              Link del proveedor
              <input name="supplierUrl" type="url" placeholder="https://" />
            </label>
            <button className="button" type="submit">
              Agregar ítem
            </button>
          </form>
          <form className="form sheet section" action={updateBudget}>
            <h2>Datos del documento</h2>
            <input type="hidden" name="id" value={budget.id} />
            <label>
              Título
              <input name="title" defaultValue={budget.title} required />
            </label>
            <div className="grid-2">
              <label>
                Destinatario
                <input name="recipient" defaultValue={budget.recipient} required />
              </label>
              <label>
                Estado
                <select name="status" defaultValue={budget.status}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {budgetStatusLabel[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Asunto
              <input name="subject" defaultValue={budget.subject} required />
            </label>
            <label>
              Fundamento
              <textarea name="rationale" defaultValue={budget.rationale} />
            </label>
            <label>
              Fecha límite para presentarlo
              <input name="dueDate" type="date" defaultValue={budget.dueDate ?? ""} />
            </label>
            <button className="button" type="submit">
              Guardar documento
            </button>
          </form>
        </>
      ) : null}
    </>
  );
}
