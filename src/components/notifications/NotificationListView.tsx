"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  GraduationCap,
  Megaphone,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationItem } from "@/lib/types/notification.type";
import { ErrorToast, formatDate, SuccessToast, timeAgo } from "@/lib/utils";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";

interface NotificationListViewProps {
  initialNotifications: NotificationItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  basePath: string;
}

export function NotificationListView({
  initialNotifications,
  meta,
  basePath,
}: NotificationListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});

  // Sync state if initialNotifications changes (e.g. on navigation or refetch)
  if (
    initialNotifications !== notifications &&
    initialNotifications.length !== notifications.length
  ) {
    // Keep local updates in sync with server revalidations
    setNotifications(initialNotifications);
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const readCount = notifications.filter((item) => item.isRead).length;
  const totalCount = notifications.length;

  // Available unique types from notifications
  const notificationTypes = Array.from(
    new Set(notifications.map((item) => item.type || "general")),
  );

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (activeTab === "unread" && item.isRead) return false;
    if (activeTab === "read" && !item.isRead) return false;

    // Type filter
    if (typeFilter !== "all" && (item.type || "general") !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    if (markingIds[id]) return;

    // Optimistic update
    setMarkingIds((prev) => ({ ...prev, [id]: true }));
    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
    );

    try {
      const res = await markNotificationRead(id);
      if (!res.success) {
        // Rollback
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isRead: false } : item,
          ),
        );
        ErrorToast(res.message || "Failed to mark notification as read");
      } else {
        SuccessToast("Notification marked as read");
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: false } : item,
        ),
      );
      ErrorToast("Failed to mark notification as read");
    } finally {
      setMarkingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    const previousNotifications = [...notifications];

    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true })),
    );

    try {
      const res = await markAllNotificationsRead();
      if (!res.success) {
        setNotifications(previousNotifications);
        ErrorToast(res.message || "Failed to mark all as read");
      } else {
        SuccessToast(res.message || "All notifications marked as read");
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setNotifications(previousNotifications);
      ErrorToast("Failed to mark all notifications as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPage || 1;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    return `${basePath}?${params.toString()}`;
  };

  const getTypeIcon = (type?: string) => {
    const t = type?.toLowerCase();
    if (t === "broadcast") {
      return <Megaphone className="h-5 w-5 text-amber-500" />;
    }
    if (t === "course" || t === "training" || t === "module") {
      return <GraduationCap className="h-5 w-5 text-emerald-500" />;
    }
    return <Bell className="h-5 w-5 text-primary" />;
  };

  const getTypeBadgeVariant = (type?: string) => {
    const t = type?.toLowerCase();
    if (t === "broadcast") return "progress";
    if (t === "course" || t === "training") return "accepted";
    return "info";
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header controls & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-foreground">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full px-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Stay up to date with alerts, training notices, and team broadcasts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
            className="flex items-center gap-2 h-9 text-xs sm:text-sm font-medium hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
          >
            {isMarkingAll ? (
              <RotateCw className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CheckCheck className="h-4 w-4 text-primary" />
            )}
            <span>Mark all as read</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as "all" | "unread" | "read")
          }
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto h-10 p-1 bg-muted/60 border border-border/40">
            <TabsTrigger
              value="all"
              className="flex items-center gap-1.5 px-4 text-xs sm:text-sm"
            >
              <span>All</span>
              <span className="rounded-full bg-muted-foreground/15 text-[11px] font-semibold px-1.5 py-0.2">
                {totalCount}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex items-center gap-1.5 px-4 text-xs sm:text-sm"
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-1.5 py-0.2">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="flex items-center gap-1.5 px-4 text-xs sm:text-sm"
            >
              <span>Read</span>
              <span className="rounded-full bg-muted-foreground/15 text-[11px] font-semibold px-1.5 py-0.2">
                {readCount}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Type filter */}
        {notificationTypes.length > 1 && (
          <div className="w-full sm:w-44">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const isUnread = !notification.isRead;
            const isMarking = markingIds[notification._id];

            return (
              <div
                key={notification._id}
                className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                  isUnread
                    ? "bg-primary/[0.03] dark:bg-primary/[0.06] border-primary/25 shadow-xs hover:border-primary/40 hover:bg-primary/[0.05]"
                    : "bg-card border-border/60 hover:border-border hover:bg-muted/20"
                }`}
              >
                {/* Left accent indicator for unread */}
                {isUnread && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
                )}

                <div className="flex items-start gap-4 flex-1 pl-1">
                  {/* Icon Avatar */}
                  <div
                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isUnread
                        ? "bg-primary/15 ring-2 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                          isUnread ? "text-foreground" : "text-foreground/90"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      {/* Type Badge */}
                      {notification.type && (
                        <Badge
                          variant={getTypeBadgeVariant(notification.type)}
                          className="text-[11px] font-medium uppercase tracking-wider"
                        >
                          {notification.type}
                        </Badge>
                      )}

                      {/* Unread dot badge */}
                      {isUnread && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    {/* Message Text */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {notification.message}
                    </p>

                    {/* Metadata / Timestamp */}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] sm:text-xs text-muted-foreground/80">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {timeAgo(notification.createdAt)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(notification.createdAt)}</span>

                      {/* If data exists and has additional keys */}
                      {Boolean(
                        notification.data &&
                          Object.keys(notification.data).length > 0 &&
                          notification.data.target,
                      ) && (
                        <>
                          <span>•</span>
                          <span className="capitalize">
                            Target: {String(notification.data?.target)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-14 sm:pl-0">
                  {isUnread ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={isMarking}
                      className="h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5"
                    >
                      {isMarking ? (
                        <RotateCw className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span>Mark as read</span>
                    </Button>
                  ) : (
                    <span className="text-[11px] sm:text-xs text-muted-foreground/70 font-medium px-2 py-1 flex items-center gap-1">
                      <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/50" />
                      Read
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border/60 rounded-xl shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mb-4 text-muted-foreground">
              {activeTab === "unread" ? (
                <Sparkles className="h-8 w-8 text-primary" />
              ) : (
                <BellOff className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground dark:text-white">
              {activeTab === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-400 max-w-sm mt-1">
              {activeTab === "unread"
                ? "You have no unread notifications right now. Check back later for updates."
                : "You're all set! Important announcements, course updates, and system alerts will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={createPageUrl(currentPage - 1)} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  // Show pages near current page or start/end
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href={createPageUrl(pageNum)}
                          isActive={isCurrent}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (
                    pageNum === 2 &&
                    currentPage > 3
                  ) {
                    return (
                      <PaginationItem key="dots-start">
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    );
                  }
                  if (
                    pageNum === totalPages - 1 &&
                    currentPage < totalPages - 2
                  ) {
                    return (
                      <PaginationItem key="dots-end">
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                },
              )}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={createPageUrl(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
