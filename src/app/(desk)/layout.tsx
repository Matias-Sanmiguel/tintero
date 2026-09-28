import { AppShell } from "@/components/app-shell";
import { roleLabel } from "@/server/format";
import { requireMember } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireMember();
  return (
    <AppShell name={member.name} role={roleLabel[member.role]}>
      {children}
    </AppShell>
  );
}
