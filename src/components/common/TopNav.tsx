"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/providers/UserProvider";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserContext();
  const isHome = pathname === "/";
  const logoSrc = user?.branding?.logo || "/acme-logo.svg";

  return (
    <header className="flex items-center justify-between px-4 h-16 bg-background border-b border-border/50 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {!isHome && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
            <span className="sr-only">Terug</span>
          </Button>
        )}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Bedrijfslogo"
            className="h-9 max-w-32 object-contain"
          />
          {!user?.branding?.logo && (
            <span className="text-xl font-bold font-heading tracking-tight text-foreground">
              Act Inc
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
            <Home className="w-5 h-5 text-foreground" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
        <Link href="/profile" passHref>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5 text-foreground" />
            <span className="sr-only">Profiel</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
