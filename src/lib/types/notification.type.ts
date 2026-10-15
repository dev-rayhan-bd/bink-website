export type AdminBroadcastData = {
  title: string;
  message: string;
  target: string;
};

export type AdminBroadcastPayload = {
  data: AdminBroadcastData;
  image?: Blob;
};

export type CompanyBroadcastPayload = {
  title: string;
  message: string;
} & (
  | { targetType: "global"; companyId?: never }
  | { targetType: "targeted"; companyId: string }
);

export type NotificationType = "general" | "broadcast" | "course" | "system" | string;

export type NotificationItem = {
  _id: string;
  user?: string | Record<string, unknown>;
  title: string;
  message: string;
  type?: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: NotificationItem[];
};

