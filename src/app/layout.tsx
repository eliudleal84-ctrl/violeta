import type { Metadata } from "next";
import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-cursive",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mis XV - Violeta",
  description: "Galería compartida para el evento de Mis XV Violeta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${greatVibes.variable} antialiased min-h-screen relative font-sans`}
      >
        {/* Dynamic Background Image Fullscreen Wrapper */}
        <div
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/violeta-bg.png')" }}
        />
        {/* Slight dark/purple gradient overlay to ensure text readability */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-purple-900/40 via-purple-900/10 to-black/60 pointer-events-none" />

        {children}
      </body>
    </html>
  );
}
