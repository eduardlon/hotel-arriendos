import type { Metadata } from "next";
import "./globals.css";
import { BusinessProvider } from "@/context/BusinessContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Hotel-Arriendos",
  description: "Sistema de gestión para hotel y arriendos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <BusinessProvider>
          <AppShell>{children}</AppShell>
        </BusinessProvider>
      </body>
    </html>
  );
}
