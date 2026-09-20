import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/cart-provider";

import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catálogo MVP",
  description: "Base técnica del catálogo con Supabase, Next.js y seguridad administrativa.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-white">
        <CartProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
            unstyled: true, // Quitamos los estilos por defecto de Sonner
            classNames: {
              toast: 'bg-[#121214] border border-zinc-800 text-white p-4 rounded-xl flex items-center gap-3 shadow-2xl min-w-[350px]',
              title: 'text-sm font-semibold text-white',
              description: 'text-xs text-zinc-400',
              // Estilo personalizado para cuando es un toast exitoso
              success: 'border-l-4 border-l-cyan-400', 
            }
          }}
          /> 
        </CartProvider>
      </body>
    </html>
  );
}
