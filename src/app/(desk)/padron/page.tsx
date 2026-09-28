import { Notice } from "@/components/Notice";
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

  return (
    <>
      <p className="kicker">Gente</p>
      <div className="spread">
        <h1>Padrón</h1>
        {staff ? (
          <a className="button secondary" href="/padron/export">
            Bajar CSV
          </a>
        ) : null}
      </div>
      <section className="stats">
        <div className="stat">
          <b>{activos.length}</b>
          <span>activos</span>
        </div>
        <div className="stat">
          <b>{activos.filter((item) => isStaff(item)).length}</b>
          <span>comisión</span>
        </div>
        <div className="stat">
          <b>{altas.length}</b>
          <span>altas del cuatrimestre</span>
        </div>
      </section>
      <Notice error={query.error} />
      <form className="form sheet" action={updateProfile}>
        <h2>Mi ficha</h2>
        <div className="grid-2">
          <label>
            Nombre
            <input name="name" defaultValue={member.name} required />
          </label>
          <label>
            Año
            <input name="year" defaultValue={member.year} />
          </label>
        </div>
        <label>
          Carrera
          <input name="career" defaultValue={member.career} />
        </label>
        <button className="button" type="submit">
          Guardar mi ficha
        </button>
      </form>
      <table className="section">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Mail</th>
            <th>Carrera</th>
            <th>Rol</th>
            <th>Estado</th>
            {staff ? <th></th> : null}
          </tr>
        </thead>
        <tbody>
          {db.members.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>
                {row.career}
                {row.year ? ` · ${row.year}` : ""}
              </td>
              {staff && row.id !== member.id ? (
                <td colSpan={3}>
                  <form className="inline" action={updateMember}>
                    <input type="hidden" name="id" value={row.id} />
                    <select name="role" defaultValue={row.role} aria-label={`Rol de ${row.name}`}>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel[role]}
                        </option>
                      ))}
                    </select>
                    <select name="status" defaultValue={row.status} aria-label={`Estado de ${row.name}`}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {memberStatusLabel[status]}
                        </option>
                      ))}
                    </select>
                    <button className="button" type="submit">
                      Guardar
                    </button>
                  </form>
                </td>
              ) : (
                <>
                  <td>{roleLabel[row.role]}</td>
                  <td>{memberStatusLabel[row.status]}</td>
                  {staff ? <td className="hint">Tu ficha</td> : null}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
