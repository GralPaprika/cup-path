"use client";

interface StorySectionProps {
  title: string;
  lead?: string;
  children: React.ReactNode;
}

export function StorySection({ title, lead, children }: StorySectionProps) {
  return (
    <section className="space-y-3 border-t border-white/8 pt-4 first:border-t-0 first:pt-0 md:space-y-4 md:pt-6">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {lead ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{lead}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
