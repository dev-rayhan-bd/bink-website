"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth.service";

export function ProfileLogoutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    await logout("/auth/login");
  };

  return (
    <div className="mt-12 px-1">
      <Button
        onClick={handleLogout}
        disabled={isPending}
        variant="outline"
        className="h-auto w-full gap-2 rounded-sm border-border/40 bg-muted p-3.5 text-destructive hover:bg-muted/70 hover:text-destructive"
      >
        <LogOut className="size-4" />
        <span className="text-[13px] font-medium">
          {isPending ? "Uitloggen..." : "Uitloggen"}
        </span>
      </Button>
    </div>
  );
}
