import { cn } from "@/lib/utils";

export interface AboutNavGroup {
  id: string;
  label: string;
}

interface AboutSectionNavProps {
  ariaLabel: string;
  groups: AboutNavGroup[];
  className?: string;
}

export function AboutSectionNav({
  ariaLabel,
  groups,
  className,
}: AboutSectionNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "glass-panel h-fit p-5 lg:sticky lg:top-[var(--shell-sticky-top)]",
        className,
      )}
    >
      <ul className="space-y-1">
        {groups.map((group) => (
          <li key={group.id}>
            <a
              href={`#${group.id}`}
              className="block rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wc-sky"
            >
              {group.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
