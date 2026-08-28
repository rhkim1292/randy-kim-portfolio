import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import EditorChrome from "@/components/EditorChrome";
import GameNav from "@/components/GameNav";
import Terminal from "@/components/Terminal";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Randy Kim's Personal Site",
  description:
    "Portfolio of software projects across web and games.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="bg-editor-bg text-editor-text font-sans antialiased">
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col">
          <div className="mt-6 flex flex-col flex-1 overflow-hidden rounded-xl border border-editor-line shadow-2xl shadow-black/40 sm:mt-10 sm:mb-10">
            <EditorChrome />
            <GameNav />
            <div className="flex flex-1 flex-col">
              {children}
            </div>
            <Terminal />
          </div>
        </main>
      </body>
    </html>
  );
}
