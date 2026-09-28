import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { load } from "./db";
import { isStaff, publicMember, type PublicMember } from "./types";

const COOKIE = "tintero_session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta SESSION_SECRET en producción.");
  }
  return "tintero-dev-secret-change-me";
}

function sign(id: string) {
  const mac = createHmac("sha256", secret()).update(id).digest("hex");
  return `${id}.${mac}`;
}

function readId(token: string | undefined) {
  if (!token) return null;
  const cut = token.lastIndexOf(".");
  if (cut <= 0) return null;
  const id = token.slice(0, cut);
  const mac = token.slice(cut + 1);
  const expected = createHmac("sha256", secret()).update(id).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export async function setSession(id: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function currentMember(): Promise<PublicMember | null> {
  const jar = await cookies();
  const id = readId(jar.get(COOKIE)?.value);
  if (!id) return null;
  const db = await load();
  const member = db.members.find((item) => item.id === id);
  if (!member || member.status !== "activo") return null;
  return publicMember(member);
}

export async function requireMember() {
  const member = await currentMember();
  if (!member) redirect("/login");
  return member;
}

export async function requireStaff() {
  const member = await requireMember();
  if (!isStaff(member)) redirect("/inicio?error=permiso");
  return member;
}
