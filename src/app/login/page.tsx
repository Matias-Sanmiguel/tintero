import { Notice } from "@/components/Notice";
import { login, register } from "@/server/actions";
import { load } from "@/server/db";
import { currentMember } from "@/server/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const member = await currentMember();
  if (member) redirect("/inicio");
  const query = await searchParams;
  const db = await load();
  const empty = db.members.length === 0;

  return (
    <div className="login">
      <section className="login-copy">
        <p className="kicker">Tecnología · Proyectos · Comunidad</p>
        <h1>
          imas<span className="plus">+</span>
        </h1>
        <p className="lead">Probá algo nuevo. Construí algo propio.</p>
      </section>
      <section className="login-panel">
        <Notice error={query.error} ok={query.ok} />
        {empty ? (
          <form className="form" action={register}>
            <h2>Crear la presidencia</h2>
            <p className="hint">La primera ficha queda activa y con rol de presidencia.</p>
            <label>
              Nombre
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Mail
              <input name="email" type="email" required autoComplete="username" />
            </label>
            <label>
              Contraseña
              <input name="password" type="password" required minLength={8} autoComplete="new-password" />
            </label>
            <button className="button" type="submit">
              Crear y entrar después
            </button>
          </form>
        ) : (
          <>
            <form className="form" action={login}>
              <h2>Entrar</h2>
              <label>
                Mail
                <input name="email" type="email" required autoComplete="username" />
              </label>
              <label>
                Contraseña
                <input name="password" type="password" required autoComplete="current-password" />
              </label>
              <button className="button" type="submit">
                Entrar
              </button>
            </form>
            <details className="alta">
              <summary>Pedir el alta</summary>
              <form className="form" action={register}>
                <div className="grid-2">
                  <label>
                    Nombre
                    <input name="name" required />
                  </label>
                  <label>
                    Mail
                    <input name="email" type="email" required />
                  </label>
                  <label>
                    Contraseña
                    <input name="password" type="password" required minLength={8} />
                  </label>
                  <label>
                    Año
                    <input name="year" />
                  </label>
                </div>
                <label>
                  Carrera
                  <input name="career" />
                </label>
                <button className="button secondary" type="submit">
                  Pedir alta
                </button>
              </form>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
