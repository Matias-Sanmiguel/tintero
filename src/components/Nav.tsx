"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/server/actions";

const links = [
  ["Inicio", "/inicio"],
  ["Tintero", "/tintero"],
  ["Proyectos", "/proyectos"],
  ["Inventario", "/inventario"],
  ["Padrón", "/padron"],
  ["Tablón", "/tablon"],
  ["Calendario", "/calendario"],
];

export function Nav({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="nav">
      <Link href="/inicio" className="brand">
        <strong>
          imas<span className="plus">+</span>
        </strong>
        <span className="club">tech club</span>
      </Link>
      <nav className="nav-links">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="who">
        <p className="name">{name}</p>
        {role === name ? null : <p className="role">{role}</p>}
        <form action={logout}>
          <button className="quiet" type="submit">
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
