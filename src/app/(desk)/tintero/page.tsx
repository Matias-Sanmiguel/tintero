import { Notice } from "@/components/Notice";
import { archiveIdea, createIdea, promoteIdea, voteIdea } from "@/server/actions";
import { load } from "@/server/db";
import { requireMember } from "@/server/session";
import { isStaff } from "@/server/types";

export default async function TinteroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const member = await requireMember();
  const db = await load();
  const ideas = [...db.ideas].sort((a, b) => b.votes.length - a.votes.length || b.createdAt.localeCompare(a.createdAt));
  const name = new Map(db.members.map((item) => [item.id, item.name]));

  return (
    <>
      <p className="kicker">Ideas</p>
      <h1>Tintero</h1>
      <p className="lead">Cualquier miembro deja una idea. La comisión la promueve a proyecto cuando decide hacerla.</p>
      <Notice error={query.error} />
      <form className="form sheet" action={createIdea}>
        <label>
          Título
          <input name="title" required />
        </label>
        <label>
          De qué se trata
          <textarea name="body" required />
        </label>
        <label>
          Tags, separados por coma
          <input name="tags" placeholder="taller, hardware" />
        </label>
        <button className="button" type="submit">
          Dejar la idea
        </button>
      </form>
      <section className="section stack">
        {ideas.map((idea) => (
          <article key={idea.id} className="sheet">
            <div className="spread">
              <h2>{idea.title}</h2>
              <span className="mono">{idea.votes.length} votos</span>
            </div>
            <p>{idea.body}</p>
            <p className="hint">
              {name.get(idea.authorId) ?? "Alguien"} · {idea.status}
            </p>
            {idea.tags.length ? (
              <div className="tags">
                {idea.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="inline">
              {idea.status !== "archivada" ? (
                <form action={voteIdea}>
                  <input type="hidden" name="ideaId" value={idea.id} />
                  <button className="button secondary" type="submit">
                    {idea.votes.includes(member.id) ? "Quitar voto" : "Votar"}
                  </button>
                </form>
              ) : null}
              {isStaff(member) && idea.status === "abierta" ? (
                <form action={promoteIdea}>
                  <input type="hidden" name="ideaId" value={idea.id} />
                  <button className="button" type="submit">
                    Promover a proyecto
                  </button>
                </form>
              ) : null}
              {idea.projectId ? (
                <a href={`/proyectos/${idea.projectId}`}>Ver proyecto</a>
              ) : null}
              {idea.status !== "promovida" && idea.status !== "archivada" && (idea.authorId === member.id || isStaff(member)) ? (
                <form action={archiveIdea}>
                  <input type="hidden" name="ideaId" value={idea.id} />
                  <button className="button secondary" type="submit">
                    Archivar
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
