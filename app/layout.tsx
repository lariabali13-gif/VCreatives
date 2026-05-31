import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "vCreative - Secure Creative Console",
  description: "Your secure client terminal for building, sharing, and deploying creative components.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-[#050811] text-slate-100 font-sans selection:bg-teal-500/20 selection:text-teal-400">
        {children}
      </body>
    </html>
  );
}
