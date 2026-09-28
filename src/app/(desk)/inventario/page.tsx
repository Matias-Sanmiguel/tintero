import { Notice } from "@/components/Notice";
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

  return (
    <>
      <p className="kicker">Cosas del club</p>
      <h1>Inventario</h1>
      <p className="lead">Qué hay, cuántos, en qué estado y dónde está. El préstamo con fecha de devolución queda para después: hoy se anota quién lo tiene.</p>
      <Notice error={query.error} />
      <div className="stack">
        {db.inventory.map((item) => (
          <form key={item.id} className="sheet form" action={updateInventory}>
            <div className="spread">
              <h2>{item.name}</h2>
              <span className="hint">{conditionLabel[item.condition]}</span>
            </div>
            <input type="hidden" name="id" value={item.id} />
            <div className="grid-2">
              <label>
                Cantidad
                <input name="quantity" type="number" min={0} defaultValue={item.quantity} disabled={!staff} />
              </label>
              <label>
                Estado
                <select name="condition" defaultValue={item.condition} disabled={!staff}>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {conditionLabel[condition]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dónde está
                <input name="location" defaultValue={item.location} disabled={!staff} />
              </label>
              <label>
                Quién lo tiene
                <input name="holder" defaultValue={item.holder} disabled={!staff} />
              </label>
            </div>
            <label>
              Proyecto de origen
              <select name="projectId" defaultValue={item.projectId ?? ""} disabled={!staff}>
                <option value="">Ninguno</option>
                {db.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            {staff ? (
              <div className="inline">
                <button className="button" type="submit">
                  Guardar
                </button>
                <button className="button secondary" type="submit" formAction={deleteInventory}>
                  Quitar
                </button>
              </div>
            ) : null}
          </form>
        ))}
      </div>
      {staff ? (
        <form className="form sheet section" action={createInventory}>
          <h2>Sumar algo</h2>
          <label>
            Nombre
            <input name="name" required />
          </label>
          <div className="grid-2">
            <label>
              Cantidad
              <input name="quantity" type="number" min={1} defaultValue={1} />
            </label>
            <label>
              Estado
              <select name="condition" defaultValue="disponible">
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {conditionLabel[condition]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dónde está
              <input name="location" />
            </label>
            <label>
              Quién lo tiene
              <input name="holder" />
            </label>
          </div>
          <button className="button" type="submit">
            Agregar al inventario
          </button>
        </form>
      ) : null}
    </>
  );
}
