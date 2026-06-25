"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXP_OPTIONS = [
  "Fresher (0 years)",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10+ Years",
] as const;

export function SearchConsole() {
  const router = useRouter();
  const [designation, setDesignation] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [showExpDropdown, setShowExpDropdown] = React.useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (designation.trim()) {
      params.set("q", designation.trim());
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }
    if (experience.trim()) {
      params.set("experience", experience.trim());
    }

    const queryStr = params.toString();
    if (queryStr) {
      router.push(`/jobs?${queryStr}`);
    } else {
      router.push("/jobs");
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form
        onSubmit={handleSearch}
        role="search"
        aria-label="Healthcare job search"
        className="bg-card/75 backdrop-blur-xl border border-border/60 rounded-2xl md:rounded-full p-2 md:p-1.5 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border/60"
      >
        {/* Designation Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
          <Search className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <div className="w-full">
            <label
              htmlFor="search-designation"
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:sr-only"
            >
              Designation / Skills
            </label>
            <input
              id="search-designation"
              type="text"
              placeholder="Enter skills, designations, or companies..."
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-transparent text-sm md:text-base focus:outline-none placeholder:text-muted-foreground py-1 text-foreground"
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
          <MapPin className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <div className="w-full">
            <label
              htmlFor="search-location"
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:sr-only"
            >
              Location
            </label>
            <input
              id="search-location"
              type="text"
              placeholder="Enter location (e.g. Pune, Mumbai)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm md:text-base focus:outline-none placeholder:text-muted-foreground py-1 text-foreground"
            />
          </div>
        </div>

        {/* Experience Dropdown */}
        <div className="relative flex-1 flex items-center justify-between gap-3 px-4 py-2 md:py-0">
          <div className="flex items-center gap-3 w-full">
            <Briefcase className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <div className="w-full text-left">
              <label
                id="search-experience-label"
                className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:sr-only"
              >
                Experience
              </label>
              <button
                type="button"
                onClick={() => setShowExpDropdown((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showExpDropdown}
                aria-labelledby="search-experience-label"
                className="w-full text-left text-sm md:text-base text-muted-foreground truncate"
              >
                {experience || "Select experience"}
              </button>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${showExpDropdown ? "rotate-180" : ""}`}
            aria-hidden="true"
          />

          {showExpDropdown && (
            <ul
              role="listbox"
              aria-labelledby="search-experience-label"
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border/40"
            >
              {EXP_OPTIONS.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={experience === opt}
                  tabIndex={0}
                  onClick={() => {
                    setExperience(opt);
                    setShowExpDropdown(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExperience(opt);
                      setShowExpDropdown(false);
                    }
                  }}
                  className="px-4 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none cursor-pointer"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit Button */}
        <div className="p-1 md:p-0">
          <Button
            type="submit"
            className="w-full md:w-auto h-12 md:h-12 px-8 rounded-xl md:rounded-full font-semibold"
          >
            Search Jobs
          </Button>
        </div>
      </form>
    </div>
  );
}
