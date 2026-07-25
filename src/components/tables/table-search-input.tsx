"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  size?: "default" | "sm";
}

export function TableSearchInput({
  value,
  onChange,
  placeholder,
  label,
  size = "default",
}: TableSearchInputProps) {
  const compact = size === "sm";

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "left-2 size-3" : "left-2.5 size-3.5",
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full rounded-md border border-white/10 bg-white/5 text-white outline-none placeholder:text-muted-foreground focus:border-wc-sky/40 focus:ring-1 focus:ring-wc-sky/30",
          compact
            ? "h-5 pr-2 pl-6 text-[11px]"
            : "h-7 pr-2.5 pl-8 text-xs",
        )}
      />
    </div>
  );
}
