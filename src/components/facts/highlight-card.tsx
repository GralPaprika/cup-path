"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HighlightCardProps {
  title: string;
  body: ReactNode;
  footnote?: string;
  href?: string;
}

export function HighlightCard({
  title,
  body,
  footnote,
  href,
}: HighlightCardProps) {
  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-white/8 bg-white/[0.03] p-4",
        href && "transition-colors hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 flex-1">{body}</div>
      {footnote ? (
        <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
