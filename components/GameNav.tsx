"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "overview", file: "tsx" },
  { href: "/projects", label: "projects", file: "log" },
  // { href: "/talents", label: "talents", file: "tree" },
];

export default function GameNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Site sections"
      className="flex overflow-x-auto border-b border-editor-line bg-editor-panelAlt"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-editor-line px-4 py-3 font-mono text-sm transition-colors ${
              isActive
                ? "bg-editor-bg text-editor-text"
                : "text-editor-muted hover:bg-editor-bg/40 hover:text-editor-text"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full bg-current ${
                isActive ? "text-editor-amber" : "text-editor-muted"
              }`}
              aria-hidden
            />
            {item.label}
            <span className="text-editor-muted">.{item.file}</span>
            {isActive && (
              <span
                className="absolute inset-x-0 bottom-0 h-[2px] bg-editor-amber"
                aria-hidden
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
