import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthJobsNow — Healthcare Jobs, Hiring Now",
  description:
    "Find healthcare jobs near you, or post openings for nurses, doctors, assistants, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-muted/30 py-10 text-center text-xs md:text-sm text-muted-foreground">
            <div className="container mx-auto max-w-6xl px-4 space-y-3">
              <p className="font-medium text-foreground/80">
                HealthJobsNow is a joint venture of <span className="font-semibold text-foreground">Deccanverse Technologies LLP</span> and <span className="font-semibold text-foreground">Vivako Consults Pvt. Ltd.</span>
              </p>
              <p>
                © {new Date().getFullYear()} HealthJobsNow. All rights reserved. Built with care for healthcare professionals.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
