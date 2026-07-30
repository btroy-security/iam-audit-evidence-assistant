import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IAM Audit Evidence Assistant",
  description:
    "An educational audit-readiness assistant for IAM controls. Not a compliance certification tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-navy text-white no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded bg-teal text-navy font-bold"
              >
                IA
              </span>
              <span className="font-semibold text-lg group-hover:text-teal-light transition-colors">
                IAM Audit Evidence Assistant
              </span>
            </Link>
            <nav
              aria-label="Primary"
              className="flex flex-wrap gap-4 text-sm font-medium"
            >
              <Link href="/" className="hover:text-teal-light transition-colors">
                Home
              </Link>
              <Link
                href="/explorer"
                className="hover:text-teal-light transition-colors"
              >
                Control Explorer
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="bg-navy-dark text-white/70 text-xs no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            Educational tool only. This application does not certify
            compliance and is not a substitute for a qualified auditor.
          </div>
        </footer>
      </body>
    </html>
  );
}
