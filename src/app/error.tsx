"use client";

import { Crash } from "@/components/Crash";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return <Crash reset={reset} />;
}
