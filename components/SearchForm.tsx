"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFormProps {
  placeholder?: string;
  initialValue?: string;
}

export function SearchForm({
  placeholder = "Search for jobs (e.g. Nurse, ICU, Clinic...)",
  initialValue = "",
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialValue);
  const generatedId = React.useId();

  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/jobs");
    } else {
      router.push(`/jobs?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search jobs"
      className="mx-auto w-full max-w-2xl mt-4"
    >
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/60 backdrop-blur p-1.5 pl-4 shadow-lg focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
        <label htmlFor={generatedId} className="sr-only">
          Search jobs
        </label>
        <Input
          id={generatedId}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10"
        />
        <Button type="submit" className="h-10 px-6 rounded-full flex-shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}
