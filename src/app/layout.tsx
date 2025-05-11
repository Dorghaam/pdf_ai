import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Chat App",
  description: "Chat with your PDF documents using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="border-b">
            <div className="container flex h-16 items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Link href="/" className="font-bold text-xl">
                  PDF Chat
                </Link>
              </div>
              <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="/upload" className="text-sm font-medium hover:underline underline-offset-4">
                  Upload
                </Link>
                <Link href="/documents" className="text-sm font-medium hover:underline underline-offset-4">
                  Documents
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
              <p className="text-center text-sm text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} PDF Chat App. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}