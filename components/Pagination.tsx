import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  totalElements,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return (
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {totalElements} job{totalElements === 1 ? "" : "s"}
      </p>
    );
  }

  const prev = page > 0 ? buildHref(page - 1) : null;
  const next = page < totalPages - 1 ? buildHref(page + 1) : null;

  return (
    <div className="mt-8 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages} · {totalElements} jobs
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={prev}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
        )}
        {next ? (
          <Link
            href={next}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
