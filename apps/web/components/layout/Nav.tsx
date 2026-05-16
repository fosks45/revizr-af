/**
 * Nav — main navigation links.
 *
 * Renders in three orientations:
 * - horizontal: top bar desktop (text links)
 * - vertical: sidebar desktop
 * - bottom-tabs: mobile bottom tab bar
 *
 * WCAG: S4 — nav uses <nav aria-label="Main navigation"> (provided by AppShell).
 * Active link has aria-current="page".
 */

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavOrientation = "horizontal" | "vertical" | "bottom-tabs";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "⌂", exact: true },
  { href: "/practice", label: "Practice", icon: "✏" },
  { href: "/progress", label: "Progress", icon: "↑" },
  { href: "/account", label: "Account", icon: "◎" },
];

const PARENT_NAV_ITEMS: NavItem[] = [
  { href: "/parent/dashboard", label: "Dashboard", icon: "⌂", exact: true },
  { href: "/parent/controls", label: "Controls", icon: "⚙" },
];

interface NavProps {
  orientation: NavOrientation;
}

export function Nav({ orientation }: NavProps) {
  const pathname = usePathname();

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const isParentSection = pathname.startsWith("/parent");
  const items = isParentSection
    ? [...NAV_ITEMS, ...PARENT_NAV_ITEMS]
    : NAV_ITEMS;

  if (orientation === "horizontal") {
    return (
      <ul role="list" className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`
                flex items-center gap-1.5 px-3 h-10
                text-sm font-medium rounded-md
                transition-colors duration-fast
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-focus-ring focus-visible:ring-offset-2
                ${
                  isActive(item)
                    ? "text-text-inverse bg-white/20"
                    : "text-text-inverse/80 hover:text-text-inverse hover:bg-white/10"
                }
              `}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  if (orientation === "vertical") {
    return (
      <ul role="list" className="flex flex-col gap-1 p-3">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md
                text-sm font-medium
                transition-colors duration-fast
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-focus-ring focus-visible:ring-offset-2
                min-h-touch-min
                ${
                  isActive(item)
                    ? "bg-bg-brand-subtle text-interactive-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-overlay"
                }
              `}
            >
              <span
                aria-hidden="true"
                className="w-5 text-center shrink-0"
              >
                {item.icon}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  // bottom-tabs
  return (
    <ul role="list" className="flex items-center justify-around w-full">
      {items.slice(0, 4).map((item) => (
        <li key={item.href} className="flex-1">
          <a
            href={item.href}
            aria-current={isActive(item) ? "page" : undefined}
            className={`
              flex flex-col items-center justify-center gap-1
              min-h-touch-large py-2 px-1
              text-2xs font-medium
              transition-colors duration-fast
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-focus-ring focus-visible:ring-inset
              ${
                isActive(item)
                  ? "text-interactive-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }
            `}
          >
            <span aria-hidden="true" className="text-lg">
              {item.icon}
            </span>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
