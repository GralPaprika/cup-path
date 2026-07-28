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
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {paragraphs[0] ? (
            <DialogDescription className="sr-only">
              {paragraphs[0]}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogBody className="space-y-4 leading-7 text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
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
