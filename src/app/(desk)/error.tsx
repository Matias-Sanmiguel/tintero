"use client";

import { Crash } from "@/components/Crash";

export default function DeskError({ reset }: { error: Error; reset: () => void }) {
  return <Crash reset={reset} />;
}
