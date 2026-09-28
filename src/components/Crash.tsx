"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Crash({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">IMAS+</p>
          <CardTitle className="text-2xl">Se cortó la página</CardTitle>
          <CardDescription>La base no respondió. Los datos siguen donde estaban.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => reset()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
