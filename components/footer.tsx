import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-10 mt-12 no-print">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4 text-sm">
          <div className="space-y-3 md:col-span-2">
            <p className="font-semibold text-foreground">HealthJobsNow</p>
            <p className="text-muted-foreground">
              A joint venture of{" "}
              <span className="font-semibold text-foreground">
                Deccanverse Technologies LLP
              </span>{" "}
              and{" "}
              <span className="font-semibold text-foreground">
                Vivako Consults Pvt. Ltd.
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Built with care for healthcare professionals.
            </p>
          </div>

          <nav aria-label="Product links" className="space-y-2">
            <p className="font-semibold text-foreground">Product</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-foreground transition-colors">
                  Browse jobs
                </Link>
              </li>
              <li>
                <Link href="/post-job" className="hover:text-foreground transition-colors">
                  Post a job
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  My profile
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company links" className="space-y-2">
            <p className="font-semibold text-foreground">Company</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info.deccanverse.pune@gmail.com"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} HealthJobsNow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
