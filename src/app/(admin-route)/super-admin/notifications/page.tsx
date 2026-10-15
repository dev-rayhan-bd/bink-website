import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import { NotificationListView } from "@/components/notifications/NotificationListView";
import type { TSearchParams } from "@/lib/types/global.type";
import type { NotificationItem } from "@/lib/types/notification.type";
import { getNotifications } from "@/services/notification.service";

export const dynamic = "force-dynamic";

export default async function SuperAdminNotificationsPage({
  searchParams,
}: {
  searchParams: TSearchParams;
}) {
  const params = await searchParams;
  const response = await getNotifications(params).catch(() => null);

  const notifications: NotificationItem[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.result)
      ? response.data.result
      : [];

  const meta = response?.data?.meta || {
    page: Number(params?.page) || 1,
    limit: Number(params?.limit) || 10,
    total: notifications.length,
    totalPage: 1,
  };

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <NotificationListView
          initialNotifications={notifications}
          meta={meta}
          basePath="/super-admin/notifications"
        />
      </DashboardPageLayout>
    </div>
  );
}
