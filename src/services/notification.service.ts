"use server";

import { updateTag } from "next/cache";
import { buildQueryString } from "@/lib/buildQueryString";
import { createMultipartBody } from "@/lib/createMultipartBody";
import { nextServerFetch } from "@/lib/nextServerFetch";
import type { ApiResponse } from "@/lib/types/api.type";
import type { TQuery } from "@/lib/types/global.type";
import type {
  AdminBroadcastPayload,
  CompanyBroadcastPayload,
  NotificationItem,
  NotificationListResponse,
} from "@/lib/types/notification.type";

export const getNotifications = async <T = NotificationListResponse>(
  params: TQuery = {}
) =>
  nextServerFetch<ApiResponse<T>>(
    `/notification${buildQueryString(params)}`,
    {
      cache: "no-store",
      next: { tags: ["notifications"] },
    }
  );

export const markAllNotificationsRead = async <T = null>() => {
  const response = await nextServerFetch<ApiResponse<T>>(
    "/notification/mark-all-read",
    {
      method: "PATCH",
    }
  );
  if (response?.success) {
    updateTag("notifications");
  }
  return response;
};

export const markNotificationRead = async <T = NotificationItem>(
  notificationId: string
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/notification/mark-read/${notificationId}`,
    { method: "PATCH" }
  );
  if (response?.success) {
    updateTag("notifications");
  }
  return response;
};

export const broadcastNotification = async <T = unknown>({
  data,
  image,
}: AdminBroadcastPayload) =>
  nextServerFetch<ApiResponse<T>>("/notification/admin/broadcast", {
    method: "POST",
    body: createMultipartBody(data, { image }),
  });

export const broadcastToCompanies = async <T = unknown>(
  payload: CompanyBroadcastPayload
) =>
  nextServerFetch<ApiResponse<T>>(
    "/notification/broadcast-to-companies",
    { method: "POST", body: payload }
  );
