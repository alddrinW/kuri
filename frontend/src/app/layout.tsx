import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KURI - Cada visita vale oro | Fidelización Física & Presencia Digital",
  description: "Plataforma de fidelización para negocios locales usando un solo llavero físico con QR permanente. Cero descargas, recompensas automáticas y presencia digital instantánea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-white">
      <body className="flex min-h-full flex-col bg-white text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
