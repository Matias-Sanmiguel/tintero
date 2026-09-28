import { Notice } from "@/components/Notice";
import { addComment, createPost, togglePin, toggleSignup } from "@/server/actions";
import { load } from "@/server/db";
import { fecha } from "@/server/format";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";

export default async function TablonPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const names = new Map(db.members.map((item) => [item.id, item.name]));
  const posts = [...db.posts].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  const staff = isStaff(member);

  return (
    <>
      <p className="kicker">Comunicación</p>
      <h1>Tablón</h1>
      <p className="lead">
        La comisión fija avisos. Cualquier miembro abre una convocatoria con cupo y el resto se anota.
      </p>
      <Notice error={query.error} />
      <div className="split">
        {staff ? (
          <form className="form sheet" action={createPost}>
            <h2>Publicar aviso</h2>
            <input type="hidden" name="kind" value="aviso" />
            <label>
              Título
              <input name="title" required />
            </label>
            <label>
              Texto
              <textarea name="body" required />
            </label>
            <label>
              Fecha, si corresponde
              <input name="eventDate" type="date" />
            </label>
            <button className="button" type="submit">
              Publicar aviso
            </button>
          </form>
        ) : (
          <p className="hint">Los avisos los publica la comisión.</p>
        )}
        <form className="form sheet" action={createPost}>
          <h2>Buscar gente</h2>
          <input type="hidden" name="kind" value="convocatoria" />
          <label>
            Título
            <input name="title" required />
          </label>
          <label>
            Qué hace falta
            <textarea name="body" required />
          </label>
          <div className="grid-2">
            <label>
              Cupo
              <input name="capacity" type="number" min={1} placeholder="Sin límite" />
            </label>
            <label>
              Día
              <input name="eventDate" type="date" />
            </label>
          </div>
          <button className="button" type="submit">
            Publicar convocatoria
          </button>
        </form>
      </div>
      <section className="section stack">
        {posts.map((post) => {
          const full = post.capacity != null && post.signups.length >= post.capacity;
          const inIt = post.signups.includes(member.id);
          return (
            <article key={post.id} className="sheet stack">
              <div className="spread">
                <div>
                  <p className="kicker">{post.kind === "aviso" ? "Aviso" : "Convocatoria"}{post.pinned ? " · fijado" : ""}</p>
                  <h2>{post.title}</h2>
                </div>
                {staff ? (
                  <form action={togglePin}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="button secondary" type="submit">
                      {post.pinned ? "Desfijar" : "Fijar"}
                    </button>
                  </form>
                ) : null}
              </div>
              <p>{post.body}</p>
              <p className="hint">
                {names.get(post.authorId) ?? "Alguien"}
                {post.eventDate ? ` · ${fecha(post.eventDate)}` : ""}
              </p>
              {post.kind === "convocatoria" ? (
                <>
                  <p className="mono">
                    {post.signups.length}
                    {post.capacity != null ? ` / ${post.capacity}` : ""} anotados
                  </p>
                  <ul>
                    {post.signups.map((id) => (
                      <li key={id}>{names.get(id) ?? "Alguien"}</li>
                    ))}
                  </ul>
                  <form action={toggleSignup}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="button" type="submit" disabled={!inIt && full}>
                      {inIt ? "Bajarme" : full ? "Cupo completo" : "Me sumo"}
                    </button>
                  </form>
                </>
              ) : null}
              <div className="stack">
                {post.comments.map((comment) => (
                  <p key={comment.id} className="comment">
                    <strong>{names.get(comment.authorId) ?? "Alguien"}.</strong> {comment.body}
                  </p>
                ))}
                <form className="inline" action={addComment}>
                  <input type="hidden" name="id" value={post.id} />
                  <label className="grow">
                    Comentario
                    <input name="body" maxLength={500} />
                  </label>
                  <button className="button secondary" type="submit">
                    Comentar
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
