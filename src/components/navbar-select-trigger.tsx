import { cn } from "@/lib/utils";

export function navbarSelectTriggerClassName(className?: string) {
  return cn(
    "h-8 border-white/15 bg-white/5 px-2 text-[11px] font-semibold tracking-wide text-white shadow-none hover:bg-white/10 focus-visible:border-wc-sky/40 focus-visible:ring-wc-sky/20 data-placeholder:text-white/70 [&_svg]:text-white/70",
    className,
  );
}
