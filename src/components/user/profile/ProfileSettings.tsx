"use client";

import Link from "next/link";
import { ChevronRight, Gavel, Headset, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ChangePasswordDrawer } from "./ChangePasswordDrawer";
import { EditProfileDrawer } from "./EditProfileDrawer";

const links = [
  { icon: Headset, label: "Privacybeleid", href: "/privacy-policy" },
  { icon: Gavel, label: "Algemene voorwaarden", href: "/terms-and-condition" },
];

export function ProfileSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 px-1">
      <h3 className="mb-4 font-heading text-[15px] font-bold">Instellingen</h3>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-sm bg-muted p-3.5 hover:bg-muted/60"
        >
          {mounted && theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="text-[13px] font-medium">
            {mounted && theme === "dark" ? "Lichte modus" : "Donkere modus"}
          </span>
        </button>

        <EditProfileDrawer />
        <ChangePasswordDrawer />

        {links.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex w-full items-center justify-between rounded-sm bg-muted p-3.5 hover:bg-muted/60"
          >
            <div className="flex items-center gap-3">
              <Icon className="size-4" />
              <span className="text-[13px] font-medium">{label}</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/50" />
          </Link>
        ))}
      </div>
    </div>
  );
}
