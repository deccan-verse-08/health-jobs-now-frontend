"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Menu, X } from "lucide-react";
import { NavAuthSection } from "./NavAuthSection";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">HealthJobsNow</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/jobs" className="hover:text-foreground transition-colors">
            Browse Jobs
          </Link>
          <Link href="/#how" className="hover:text-foreground transition-colors">
            How it works
          </Link>
        </nav>

        {/* Desktop auth section — hidden on mobile, shown from md up */}
        <div className="hidden md:flex items-center">
          <NavAuthSection />
        </div>

        {/* Mobile hamburger button — shown on mobile, hidden from md up */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur md:hidden">
          <div className="container mx-auto max-w-6xl space-y-4 px-4 py-4">
            {/* Navigation links */}
            <nav className="flex flex-col gap-2 text-sm font-medium">
              <Link
                href="/jobs"
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/#how"
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                How it works
              </Link>
            </nav>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Auth section */}
            <div className="flex flex-col gap-2">
              <NavAuthSection mobile />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
