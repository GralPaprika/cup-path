export const NAV_LINKS = [
  { href: "/", key: "teamAnalysis" as const },
  { href: "/overview", key: "overview" as const },
  { href: "/groups", key: "groups" as const },
  { href: "/compare", key: "compare" as const },
  { href: "/simulate", key: "simulate" as const },
  { href: "/about", key: "about" as const },
] as const;

export type NavLinkKey = (typeof NAV_LINKS)[number]["key"];
