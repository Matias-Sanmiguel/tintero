import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
