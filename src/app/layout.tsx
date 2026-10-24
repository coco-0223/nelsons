import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NELSON'S — Pizzas y Focaccias Gourmet",
  description: "Pizzas y Focaccias Gourmet de Nelson's. Pedí para hoy o programá tu pedido para otra fecha.",
};

import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { DevTools } from "@/components/DevTools";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <AuthModal />
          <DevTools />
        </AuthProvider>
      </body>
    </html>
  );
}
