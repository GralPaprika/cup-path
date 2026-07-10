"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  id?: string;
  size?: "default" | "sm";
  accent?: "green" | "sky";
}

export function Switch({
  checked,
  disabled,
  onChange,
  id,
  size = "default",
  accent = "green",
}: SwitchProps) {
  const sm = size === "sm";

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex shrink-0 rounded-full transition-colors",
        sm ? "h-4 w-7" : "h-5 w-9",
        disabled && "cursor-not-allowed opacity-40",
        checked
          ? accent === "sky"
            ? "bg-wc-sky"
            : "bg-wc-green"
          : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute rounded-full bg-white shadow-sm transition-transform",
          sm ? "top-0.5 size-3" : "top-0.5 size-4",
          checked ? (sm ? "left-[14px]" : "left-[18px]") : "left-0.5",
        )}
      />
    </button>
  );
}
