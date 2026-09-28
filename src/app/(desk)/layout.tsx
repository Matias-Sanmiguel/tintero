import { Nav } from "@/components/Nav";
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
    <div className="shell">
      <Nav name={member.name} role={roleLabel[member.role]} />
      <main className="main">{children}</main>
    </div>
  );
}
