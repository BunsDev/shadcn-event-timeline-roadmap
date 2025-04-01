"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const noHeaderRoutes = ["/horizontal", "/vertical"];
  const showHeader = !noHeaderRoutes.includes(pathname);
  return (
    <header
      className={cn(
        !showHeader && "hidden",
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold">Timeline Roadmap</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
