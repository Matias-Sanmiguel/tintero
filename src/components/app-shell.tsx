"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  House,
  Lightbulb,
  LogOut,
  Megaphone,
  Package,
  Users,
} from "lucide-react";
import { logout } from "@/server/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const links = [
  { href: "/inicio", label: "Inicio", icon: House },
  { href: "/tintero", label: "Tintero", icon: Lightbulb },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/padron", label: "Padrón", icon: Users },
  { href: "/tablon", label: "Tablón", icon: Megaphone },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="IMAS+">
                <Link href="/inicio">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-wordmark text-lg text-primary-foreground">
                    <span className="text-accent">+</span>
                  </span>
                  <span className="grid text-left leading-tight">
                    <span className="font-wordmark text-xl tracking-tight text-primary">
                      imas<span className="text-accent">+</span>
                    </span>
                    <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">tech club</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Mesa</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  const Icon = link.icon;
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={link.label}
                        className={
                          active
                            ? "bg-accent! text-accent-foreground! hover:bg-accent! hover:text-accent-foreground!"
                            : undefined
                        }
                      >
                        <Link href={link.href}>
                          <Icon />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-2">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials(name) || "IM"}</AvatarFallback>
                </Avatar>
                <span className="grid min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium">{name}</span>
                  {role === name ? null : <span className="truncate text-xs text-muted-foreground">{role}</span>}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>{name}</DropdownMenuLabel>
              {role === name ? null : (
                <p className="px-1.5 pb-1 text-xs text-muted-foreground">{role}</p>
              )}
              <DropdownMenuSeparator />
              <form id="logout-form" action={logout} />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  const form = document.getElementById("logout-form");
                  if (form instanceof HTMLFormElement) form.requestSubmit();
                }}
              >
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <p className="font-wordmark text-lg tracking-tight text-primary">
            imas<span className="text-accent">+</span>
          </p>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
