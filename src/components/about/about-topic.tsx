import Link from "next/link";

interface AboutTopicProps {
  title: string;
  body: string;
  openHref?: string;
  openLabel?: string;
  source?: { href: string; label: string };
}

export function AboutTopic({
  title,
  body,
  openHref,
  openLabel,
  source,
}: AboutTopicProps) {
  return (
    <div className="space-y-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="space-y-4 leading-7 text-muted-foreground">
        {body.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {openHref && openLabel ? (
          <p>
            <Link href={openHref} className="text-wc-sky hover:underline">
              {openLabel}
            </Link>
          </p>
        ) : null}
        {source ? (
          <p>
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="text-wc-sky hover:underline"
            >
              {source.label}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
