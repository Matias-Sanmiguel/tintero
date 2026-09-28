import { load } from "@/server/db";
import { memberStatusLabel, roleLabel } from "@/server/format";
import { currentMember } from "@/server/session";
import { isStaff } from "@/server/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const member = await currentMember();
  if (!member || !isStaff(member)) {
    return new NextResponse("Solo la comisión baja el padrón.", { status: 403 });
  }
  const db = await load();
  const header = ["nombre", "mail", "rol", "carrera", "año", "estado", "alta"];
  const lines = db.members.map((row) =>
    [
      row.name,
      row.email,
      roleLabel[row.role],
      row.career,
      row.year,
      memberStatusLabel[row.status],
      row.joinedAt.slice(0, 10),
    ]
      .map(cell)
      .join(","),
  );
  const csv = `\uFEFF${header.join(",")}\n${lines.join("\n")}\n`;
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="padron.csv"',
    },
  });
}
