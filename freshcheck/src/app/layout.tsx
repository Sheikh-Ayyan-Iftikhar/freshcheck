import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FreshCheck — AI Stale-Answer Detector",
  description: "Find out whether an AI-generated answer is still up to date.",
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `try{if(localStorage.getItem("freshcheck.theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className={inter.variable}>
        <AppShell>{children}</AppShell>
        <Toaster theme="system" position="top-right" richColors />
      </body>
    </html>
  );
}
