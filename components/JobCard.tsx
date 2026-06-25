import Link from "next/link";
import { Briefcase, MapPin, Building2, Clock, Banknote, ArrowRight, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatDate, cn, getDeadlineCountdown } from "@/lib/utils";
import type { Job } from "@/types/api";

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", job.featured && "border-amber-500/30 bg-amber-500/[0.01]")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>
              <Link href={`/jobs/${job.id}`} className="hover:text-primary">
                {job.title}
              </Link>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {job.company}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </span>
              {job.salary && (
                <span className="inline-flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" /> {job.salary}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {job.featured && (
              <Badge variant="warning" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold flex items-center gap-0.5">
                <Crown className="h-3 w-3 shrink-0" /> Featured
              </Badge>
            )}
            {job.employmentType && <Badge variant="default">{job.employmentType}</Badge>}
            {job.experienceLevel && <Badge variant="secondary">{job.experienceLevel}</Badge>}
            {job.applicationDeadline && (
              (() => {
                const countdown = getDeadlineCountdown(job.applicationDeadline);
                if (!countdown) return null;
                return (
                  <Badge
                    variant={countdown.urgent ? "destructive" : "outline"}
                    className={cn(
                      "font-semibold flex items-center gap-0.5",
                      countdown.urgent && "bg-destructive/10 text-destructive border-destructive/20 animate-pulse motion-reduce:animate-none",
                      countdown.closed && "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {countdown.text}
                  </Badge>
                );
              })()
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> Posted {formatDate(job.postedDate ?? job.createdDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(job.lastModifiedDate ?? job.postedDate ?? job.createdDate)}
            </span>
          </div>
          <Link
            href={`/jobs/${job.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 shrink-0")}
          >
            View & Apply <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
