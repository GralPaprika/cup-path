"use client";

import Link from "next/link";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AboutDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  externalHref?: string;
  externalLabel?: string;
}

type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseDetailBody(body: string): BodyBlock[] {
  const paragraphs = body.split("\n\n").filter(Boolean);
  const blocks: BodyBlock[] = [];
  let listItems: string[] | null = null;

  function flushList() {
    if (!listItems) return;
    blocks.push({ type: "list", items: listItems });
    listItems = null;
  }

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith("- ")) {
      listItems ??= [];
      listItems.push(paragraph.slice(2));
      continue;
    }
    flushList();
    blocks.push({ type: "paragraph", text: paragraph });
  }

  flushList();
  return blocks;
}

export function AboutDetailDialog({
  open,
  onOpenChange,
  title,
  body,
  actionHref,
  actionLabel,
  externalHref,
  externalLabel,
}: AboutDetailDialogProps) {
  const blocks = parseDetailBody(body);
  const description =
    blocks.find((block) => block.type === "paragraph")?.text ??
    (blocks[0]?.type === "list" ? blocks[0].items[0] : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogBody className="space-y-4 leading-7 text-muted-foreground">
          {blocks.map((block, index) =>
            block.type === "paragraph" ? (
              <p key={index}>{block.text}</p>
            ) : (
              <ul key={index} className="list-disc space-y-3 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </DialogBody>
        {(actionHref && actionLabel) || (externalHref && externalLabel) ? (
          <DialogFooter>
            {externalHref && externalLabel ? (
              <a
                href={externalHref}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {externalLabel}
              </a>
            ) : null}
            {actionHref && actionLabel ? (
              <Link
                href={actionHref}
                className={cn(buttonVariants())}
                onClick={() => onOpenChange(false)}
              >
                {actionLabel}
              </Link>
            ) : null}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
