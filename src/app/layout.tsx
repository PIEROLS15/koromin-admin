import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KoroMin Anime Merch",
  description: "Sistema administrativo de pedidos, inventario, ventas y finanzas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body>{children}</body>
    </html>
  );
}
