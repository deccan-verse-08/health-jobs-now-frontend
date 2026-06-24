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

  // Sync state if initial value changes (e.g. navigating between search results)
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
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl mt-4">
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/60 backdrop-blur p-1.5 pl-4 shadow-lg focus-within:ring-2 focus-within:ring-primary/50">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-base focus:outline-none placeholder:text-muted-foreground min-w-0 py-2"
        />
        <Button
          type="submit"
          className="h-10 px-6 rounded-full flex-shrink-0"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
