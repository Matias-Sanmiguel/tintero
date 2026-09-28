import { redirect } from "next/navigation";
import { currentMember } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const member = await currentMember();
  redirect(member ? "/inicio" : "/login");
}
