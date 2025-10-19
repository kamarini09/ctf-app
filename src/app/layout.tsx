// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Fredoka, Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "KCTF",
  description: "Capture The Flag",
};

const display = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
