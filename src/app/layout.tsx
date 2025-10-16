// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rhythmos",
  description: "A personal experiment in cyclical, non-linear self-healing logs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* fonts come from globals.css; no font variables needed here */}
      <body className="antialiased min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
          {children}

          <div className="h-px my-10 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

          <footer className="text-xs text-center text-[var(--text-secondary)]">
            <p>
              Rhythmos is an ongoing personal prototype —{" "}
              <Link
                href="/about"
                className="underline underline-offset-2 hover:text-[var(--text-primary)]"
              >
                learn more →
              </Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}