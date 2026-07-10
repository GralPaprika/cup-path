"use client";

import { cn } from "@/lib/utils";

export function PickerList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/[0.03] p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PickerItem({
  active = false,
  disabled = false,
  onClick,
  className,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
        disabled && "cursor-not-allowed opacity-40",
        active
          ? "bg-white/12 text-white shadow-sm ring-1 ring-white/10"
          : "text-muted-foreground hover:bg-white/6 hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PickerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}
