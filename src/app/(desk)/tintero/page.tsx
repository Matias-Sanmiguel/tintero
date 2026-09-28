import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Notice } from "@/components/Notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <PageHeader
        kicker="Ideas"
        title="Tintero"
        description="Cualquier miembro deja una idea. La comisión la promueve a proyecto cuando decide hacerla."
      />
      <Notice error={query.error} />
      <Card>
        <CardHeader>
          <CardTitle>Dejar una idea</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={createIdea}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="idea-title">Título</FieldLabel>
                <Input id="idea-title" name="title" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="idea-body">De qué se trata</FieldLabel>
                <Textarea id="idea-body" name="body" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="idea-tags">Tags, separados por coma</FieldLabel>
                <Input id="idea-tags" name="tags" placeholder="taller, hardware" />
              </Field>
            </FieldGroup>
            <Button type="submit">Dejar la idea</Button>
          </form>
        </CardContent>
      </Card>
      <section className="flex flex-col gap-3">
        {ideas.map((idea) => (
          <Card key={idea.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{idea.title}</CardTitle>
                <Badge variant="secondary">{idea.votes.length} votos</Badge>
              </div>
              <CardDescription>
                {name.get(idea.authorId) ?? "Alguien"} · {idea.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>{idea.body}</p>
              {idea.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                {idea.status !== "archivada" ? (
                  <form action={voteIdea}>
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <Button variant="outline" type="submit">
                      {idea.votes.includes(member.id) ? "Quitar voto" : "Votar"}
                    </Button>
                  </form>
                ) : null}
                {isStaff(member) && idea.status === "abierta" ? (
                  <form action={promoteIdea}>
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <Button type="submit">Promover a proyecto</Button>
                  </form>
                ) : null}
                {idea.projectId ? (
                  <Button variant="link" asChild>
                    <Link href={`/proyectos/${idea.projectId}`}>Ver proyecto</Link>
                  </Button>
                ) : null}
                {idea.status !== "promovida" && idea.status !== "archivada" && (idea.authorId === member.id || isStaff(member)) ? (
                  <form action={archiveIdea}>
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <Button variant="outline" type="submit">
                      Archivar
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
