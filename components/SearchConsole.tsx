"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchConsole() {
  const router = useRouter();
  const [designation, setDesignation] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [showExpDropdown, setShowExpDropdown] = React.useState(false);

  const expOptions = [
    "Fresher (0 years)",
    "1-3 Years",
    "3-5 Years",
    "5-10 Years",
    "10+ Years",
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    let query = "";
    if (designation.trim()) {
      query = designation.trim();
    } else if (location.trim()) {
      query = location.trim();
    }

    if (query) {
      router.push(`/jobs?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/jobs");
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="bg-card/75 backdrop-blur-xl border border-border/60 rounded-2xl md:rounded-full p-2 md:p-1.5 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border/60"
      >
        {/* Designation Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <div className="w-full">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:hidden">
              Designation / Skills
            </label>
            <input
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
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div className="w-full">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:hidden">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter location (e.g. Pune, Mumbai)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm md:text-base focus:outline-none placeholder:text-muted-foreground py-1 text-foreground"
            />
          </div>
        </div>

        {/* Experience Dropdown (Visual decoration matching Naukri) */}
        <div className="relative flex-1 flex items-center justify-between gap-3 px-4 py-2 md:py-0 cursor-pointer" onClick={() => setShowExpDropdown(!showExpDropdown)}>
          <div className="flex items-center gap-3 w-full">
            <Briefcase className="h-5 w-5 text-primary shrink-0" />
            <div className="w-full text-left">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block md:hidden">
                Experience
              </label>
              <div className="text-sm md:text-base text-muted-foreground truncate">
                {experience || "Select experience"}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />

          {showExpDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border/40">
              {expOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExperience(opt);
                    setShowExpDropdown(false);
                  }}
                  className="px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="p-1 md:p-0">
          <Button
            type="submit"
            className="w-full md:w-auto h-12 md:h-12 px-8 rounded-xl md:rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-lg hover:shadow-primary/20 transition duration-300 transform active:scale-95"
          >
            Search Jobs
          </Button>
        </div>
      </form>
    </div>
  );
}
