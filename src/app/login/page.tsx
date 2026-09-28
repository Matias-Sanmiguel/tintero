import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="relative flex min-h-80 flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:min-h-svh lg:p-12">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary-foreground/80">
          Tecnología · Proyectos · Comunidad
        </p>
        <div className="relative z-10">
          <h1 className="font-wordmark text-7xl tracking-tight md:text-8xl">
            imas<span className="text-accent">+</span>
          </h1>
          <p className="mt-4 max-w-sm text-2xl">Probá algo nuevo. Construí algo propio.</p>
        </div>
        <span className="absolute top-8 right-8 size-10 bg-white" aria-hidden />
        <span className="absolute right-8 bottom-8 size-24 rounded-full bg-accent" aria-hidden />
      </section>
      <section className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{empty ? "Crear la presidencia" : "Entrar"}</CardTitle>
            <CardDescription>
              {empty
                ? "La primera ficha queda activa y con rol de presidencia."
                : "Mesa de trabajo de IMAS+ tech club."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Notice error={query.error} ok={query.ok} />
            {empty ? (
              <form className="flex flex-col gap-4" action={register}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input id="name" name="name" required autoComplete="name" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Mail</FieldLabel>
                    <Input id="email" name="email" type="email" required autoComplete="username" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit">Crear y entrar después</Button>
              </form>
            ) : (
              <>
                <form className="flex flex-col gap-4" action={login}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Mail</FieldLabel>
                      <Input id="email" name="email" type="email" required autoComplete="username" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                      />
                    </Field>
                  </FieldGroup>
                  <Button type="submit">Entrar</Button>
                </form>
                <Separator />
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="link" className="px-0">
                      Pedir el alta
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <form className="flex flex-col gap-4" action={register}>
                      <FieldGroup>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor="alta-name">Nombre</FieldLabel>
                            <Input id="alta-name" name="name" required />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="alta-email">Mail</FieldLabel>
                            <Input id="alta-email" name="email" type="email" required />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="alta-password">Contraseña</FieldLabel>
                            <Input id="alta-password" name="password" type="password" required minLength={8} />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="alta-year">Año</FieldLabel>
                            <Input id="alta-year" name="year" />
                          </Field>
                        </div>
                        <Field>
                          <FieldLabel htmlFor="alta-career">Carrera</FieldLabel>
                          <Input id="alta-career" name="career" />
                        </Field>
                      </FieldGroup>
                      <Button variant="outline" type="submit">
                        Pedir alta
                      </Button>
                    </form>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
