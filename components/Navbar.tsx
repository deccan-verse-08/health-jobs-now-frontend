"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X } from "lucide-react";
import { NavAuthSection } from "./NavAuthSection";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/about", label: "About" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
          aria-label="HealthJobsNow home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">HealthJobsNow</span>
        </Link>

        {/* Desktop nav links — centered in their own column */}
        <nav aria-label="Primary" className="hidden items-center justify-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth section — pushed to the right edge */}
        <div className="hidden md:flex items-center justify-end">
          <NavAuthSection />
        </div>

        {/* Mobile hamburger button — pushed to the far right on small screens */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-background md:hidden"
        >
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <nav aria-label="Mobile primary" className="flex flex-col gap-1 text-sm font-medium">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
                      active ? "bg-primary/10 text-primary font-semibold" : "text-foreground/80"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 h-px bg-border" aria-hidden="true" />

            <div className="flex flex-col gap-1.5">
              <NavAuthSection mobile />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}