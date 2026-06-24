import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Users,
  Stethoscope,
  Activity,
  HeartPulse,
  Microscope,
  Landmark,
  Sparkles,
  Star,
  Award,
} from "lucide-react";
import { API_BASE } from "@/lib/constants";
import { JobList } from "@/components/JobList";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { SearchConsole } from "@/components/SearchConsole";
import type { Job, PageResponse } from "@/types/api";

async function fetchRecentJobs(): Promise<Job[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/jobs?page=0&size=6&sortBy=createdDate&direction=desc`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as PageResponse<Job>;
    return data.content ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const jobs = await fetchRecentJobs();

  const categories = [
    {
      title: "Clinical & Medical",
      desc: "Doctors, specialists, surgeons",
      count: "1,200+ Jobs",
      icon: Stethoscope,
      query: "Doctor",
      color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    },
    {
      title: "Nursing & Patient Care",
      desc: "ICU, ER, general nurses",
      count: "2,500+ Jobs",
      icon: HeartPulse,
      query: "Nurse",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Diagnostics & Labs",
      desc: "Technicians, radiologists",
      count: "800+ Jobs",
      icon: Microscope,
      query: "Lab",
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      title: "Administration & Management",
      desc: "Managers, billing, HR",
      count: "450+ Jobs",
      icon: Landmark,
      query: "Manager",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      title: "Therapy & Rehabilitation",
      desc: "Physio, occupational therapists",
      count: "600+ Jobs",
      icon: Activity,
      query: "Physiotherapist",
      color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    },
  ];

  const popularSearches = [
    { label: "Nurse", q: "Nurse" },
    { label: "ICU", q: "ICU" },
    { label: "Physiotherapist", q: "Physiotherapist" },
    { label: "Resident Doctor", q: "Doctor" },
    { label: "Lab Technician", q: "Lab" },
  ];

  const featuredHospitals = [
    {
      name: "Apollo Hospitals",
      rating: "4.3",
      reviews: "1.2k+ reviews",
      location: "Pune, Maharashtra",
      jobs: "24 Openings",
      desc: "Asia's leading integrated healthcare services provider.",
      logoBg: "bg-emerald-600 text-white",
    },
    {
      name: "Max Healthcare",
      rating: "4.2",
      reviews: "800+ reviews",
      location: "Mumbai, Maharashtra",
      jobs: "18 Openings",
      desc: "One of India's largest healthcare providers with top facilities.",
      logoBg: "bg-sky-600 text-white",
    },
    {
      name: "Fortis Healthcare",
      rating: "4.1",
      reviews: "950+ reviews",
      location: "New Delhi, Delhi",
      jobs: "32 Openings",
      desc: "A pioneer multispecialty healthcare delivery institution.",
      logoBg: "bg-indigo-600 text-white",
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen font-sans">
      {/* Background blobs for premium glassmorphism feel — decorative only */}
      <div aria-hidden="true" className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div aria-hidden="true" className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/40 bg-gradient-to-b from-background via-background/60 to-transparent">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> India&apos;s Premium Healthcare Job Portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.15]">
              Find your dream job in <br />
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                healthcare & medicine
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Explore 10,000+ verified active vacancies from top-tier multispecialty hospitals, clinics, and research laboratories.
            </p>
            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              A Joint Venture of Deccanverse Technologies LLP &amp; Vivako Consults Pvt. Ltd.
            </p>
          </div>

          {/* Search Console */}
          <div className="mt-10 mb-6">
            <SearchConsole />
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
            <span className="text-muted-foreground">Trending Searches:</span>
            {popularSearches.map((ps) => (
              <Link
                key={ps.label}
                href={`/jobs?q=${encodeURIComponent(ps.q)}`}
                className="px-3.5 py-1 rounded-full border border-border/80 bg-card hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-primary transition duration-200 text-xs font-medium"
              >
                {ps.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">15,000+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Jobs</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">800+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">Top Hospitals</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">2 Lakh+</p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">Job Seekers</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-foreground">98%</p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">Match Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Job Category */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Explore Healthcare Categories
            </h2>
            <p className="text-muted-foreground">
              Browse vacancies organized by departments and clinical specialities.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  href={`/jobs?q=${encodeURIComponent(cat.query)}`}
                  className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${cat.color} transition duration-300 group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>{cat.count}</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hospitals actively hiring */}
      <section className="py-20 border-t border-border/40 bg-muted/10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Featured Employers
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                Multi-specialty hospitals and medical institutions actively recruitment.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline hover:gap-2 transition-all shrink-0"
            >
              See all active recruiters <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredHospitals.map((hosp) => (
              <CardHosp key={hosp.name} hosp={hosp} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent openings */}
      <section className="py-20 border-t border-border/40">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Recent Openings
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                The latest clinical and administrative healthcare positions posted today.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0"
            >
              See all jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-16 text-center">
              <p className="text-muted-foreground font-medium">
                No jobs have been posted yet. Create a job listing to get started.
              </p>
            </div>
          ) : (
            <JobList jobs={jobs} />
          )}
        </div>
      </section>

      {/* Recruiter & Seeker Split Call-To-Action */}
      <section className="py-20 bg-gradient-to-b from-transparent to-primary/5 border-t border-border/40">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Seeker CTA Card */}
            <div className="group rounded-3xl border border-border/60 bg-card/50 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    Get Discovered by Top Recruiters
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload your medical resume and experience details to let recruitment specialists match you with premium healthcare facilities.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/my-jobs"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto font-semibold shadow-md rounded-2xl"
                  )}
                >
                  Submit Resume <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </div>
            </div>

            {/* Recruiter CTA Card */}
            <div className="group rounded-3xl border border-border/60 bg-card/50 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    Hiring Healthcare Professionals?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Advertise clinical vacancies directly to registered practitioners, nursing staff, technicians, and administrators.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  href="/post-job"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-2xl border-none"
                  )}
                >
                  Post a Position <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface HospitalData {
  name: string;
  rating: string;
  reviews: string;
  location: string;
  jobs: string;
  desc: string;
  logoBg: string;
}

function CardHosp({ hosp }: { hosp: HospitalData }) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow ${hosp.logoBg}`}>
            {hosp.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              {hosp.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" /> {hosp.rating}
              </span>
              <span>•</span>
              <span>{hosp.reviews}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hosp.desc}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{hosp.location}</span>
        <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          {hosp.jobs}
        </span>
      </div>
    </div>
  );
}
