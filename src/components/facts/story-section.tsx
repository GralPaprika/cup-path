"use client";

interface StorySectionProps {
  title: string;
  lead: string;
  children: React.ReactNode;
}

export function StorySection({ title, lead, children }: StorySectionProps) {
  return (
    <section className="space-y-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{lead}</p>
      </div>
      {children}
    </section>
  );
}
