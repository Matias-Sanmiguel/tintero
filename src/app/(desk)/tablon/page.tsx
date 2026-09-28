import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
      <PageHeader
        kicker="Comunicación"
        title="Tablón"
        description="La comisión fija avisos. Cualquier miembro abre una convocatoria con cupo y el resto se anota."
      />
      <Notice error={query.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        {staff ? (
          <Card>
            <CardHeader>
              <CardTitle>Publicar aviso</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" action={createPost}>
                <input type="hidden" name="kind" value="aviso" />
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="aviso-title">Título</FieldLabel>
                    <Input id="aviso-title" name="title" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="aviso-body">Texto</FieldLabel>
                    <Textarea id="aviso-body" name="body" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="aviso-date">Fecha, si corresponde</FieldLabel>
                    <Input id="aviso-date" name="eventDate" type="date" />
                  </Field>
                </FieldGroup>
                <Button type="submit">Publicar aviso</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Los avisos los publica la comisión.</p>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Buscar gente</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" action={createPost}>
              <input type="hidden" name="kind" value="convocatoria" />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="call-title">Título</FieldLabel>
                  <Input id="call-title" name="title" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="call-body">Qué hace falta</FieldLabel>
                  <Textarea id="call-body" name="body" required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="call-capacity">Cupo</FieldLabel>
                    <Input id="call-capacity" name="capacity" type="number" min={1} placeholder="Sin límite" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="call-date">Día</FieldLabel>
                    <Input id="call-date" name="eventDate" type="date" />
                  </Field>
                </div>
              </FieldGroup>
              <Button type="submit">Publicar convocatoria</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <section className="flex flex-col gap-3">
        {posts.map((post) => {
          const full = post.capacity != null && post.signups.length >= post.capacity;
          const inIt = post.signups.includes(member.id);
          return (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={post.kind === "aviso" ? "default" : "secondary"}>
                        {post.kind === "aviso" ? "Aviso" : "Convocatoria"}
                      </Badge>
                      {post.pinned ? <Badge className="bg-accent text-accent-foreground">Fijado</Badge> : null}
                    </div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {names.get(post.authorId) ?? "Alguien"}
                      {post.eventDate ? ` · ${fecha(post.eventDate)}` : ""}
                    </CardDescription>
                  </div>
                  {staff ? (
                    <form action={togglePin}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button variant="outline" type="submit">
                        {post.pinned ? "Desfijar" : "Fijar"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>{post.body}</p>
                {post.kind === "convocatoria" ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {post.signups.length}
                      {post.capacity != null ? ` / ${post.capacity}` : ""} anotados
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      {post.signups.map((id) => (
                        <li key={id}>{names.get(id) ?? "Alguien"}</li>
                      ))}
                    </ul>
                    <form action={toggleSignup}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button type="submit" disabled={!inIt && full}>
                        {inIt ? "Bajarme" : full ? "Cupo completo" : "Me sumo"}
                      </Button>
                    </form>
                  </>
                ) : null}
                <Separator />
                <div className="flex flex-col gap-3">
                  {post.comments.map((comment) => (
                    <p key={comment.id} className="text-sm">
                      <span className="font-medium">{names.get(comment.authorId) ?? "Alguien"}.</span> {comment.body}
                    </p>
                  ))}
                  <form className="flex flex-wrap items-end gap-2" action={addComment}>
                    <input type="hidden" name="id" value={post.id} />
                    <Field className="min-w-48 flex-1">
                      <FieldLabel htmlFor={`comment-${post.id}`}>Comentario</FieldLabel>
                      <Input id={`comment-${post.id}`} name="body" maxLength={500} />
                    </Field>
                    <Button variant="outline" type="submit">
                      Comentar
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
