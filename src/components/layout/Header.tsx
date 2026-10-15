"use client";

import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInitials, getParticipantFirstName } from "@/lib/utils";
import { useUserContext } from "@/providers/UserProvider";
import { getNotifications } from "@/services/notification.service";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useUserContext();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isSuperAdmin = pathname?.startsWith("/super-admin") || user?.role === "superAdmin" || user?.role === "admin";

  useEffect(() => {
    if (isSuperAdmin) return;
    let isMounted = true;

    getNotifications({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.data) {
          const items = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data.result)
              ? res.data.result
              : [];
          const count = items.filter((n) => !n.isRead).length;
          setUnreadCount(count);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin, pathname]);

  const roleTitle =
    user?.role === "superAdmin"
      ? "Super Admin"
      : user?.role === "company"
        ? "Company"
        : "Admin";
  const profileLink = isSuperAdmin ? "/super-admin/profile" : "/company/profile";
  const userFirstName = getParticipantFirstName(user);
  const greeting = userFirstName
    ? `Welcome back, ${userFirstName}`
    : user?.role === "superAdmin" || user?.role === "company"
      ? `Welcome back, ${roleTitle}`
      : "Welcome back";
  const userDisplayName =
    user?.fullName && !/^(user|admin|guest)$/i.test(user.fullName.trim())
      ? user.fullName
      : roleTitle;

  return (
    <header className="absolute top-0 right-0 left-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-20 flex items-center justify-between px-4 lg:px-8 transition-all">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold font-heading hidden sm:block">
          {greeting}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell (Only for Company) */}
        {!isSuperAdmin && (
          <Link
            href="/company/notifications"
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* User Profile */}
        <Link href={profileLink}>
          <div className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium leading-none">
                {userDisplayName}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{roleTitle}</span>
            </div>
            <Avatar size="lg">
              {user?.image && <AvatarImage src={user.image} alt={userDisplayName} />}
              <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
            </Avatar>
          </div>
        </Link>
      </div>
    </header>
  );
}
