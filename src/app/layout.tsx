import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const display = Nunito({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "IMAS+",
  description: "Mesa de trabajo de IMAS+ tech club",
  robots: { index: false, follow: false },
};

const themeScript = `(function(){try{var t=localStorage.getItem("tintero-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={cn(sans.variable, display.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
