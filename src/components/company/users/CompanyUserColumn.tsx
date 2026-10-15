"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CompanyUser } from "@/lib/types/user.type";
import { formatDate, getInitials } from "@/lib/utils";

export const columns: ColumnDef<CompanyUser>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8 border border-border">
          {row.original.image && (
            <AvatarImage
              src={row.original.image}
              alt={row.original.fullName}
            />
          )}
          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
            {getInitials(row.original.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {row.original.fullName}
          </p>
          <p className="text-xs capitalize text-muted-foreground">
            {row.original.role}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "identifier",
    header: "Email / ID",
    cell: ({ row }) => {
      const user = row.original;
      const isEmailAuth = user.authType === "email";
      const isEmployeeIdAuth = user.authType === "employeeId";

      if (isEmailAuth) {
        const isRealEmail =
          user.email &&
          !user.email.includes("@actinc.local") &&
          !user.email.startsWith("passcode_");
        return (
          <span className="text-muted-foreground">
            {isRealEmail ? user.email : "—"}
          </span>
        );
      }

      if (isEmployeeIdAuth || user.employeeId) {
        return (
          <span className="text-muted-foreground font-mono text-xs">
            {user.employeeId || "—"}
          </span>
        );
      }

      return <span className="text-muted-foreground/40">—</span>;
    },
  },
  {
    accessorKey: "authType",
    header: "Login Method",
    cell: ({ row }) => {
      const labels: Record<string, string> = {
        employeeId: "Employee ID",
        qr: "QR Code",
        email: "Email",
      };

      return (
        <span className="text-muted-foreground">
          {labels[row.original.authType] || row.original.authType}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "active" : "blocked"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastActiveAt",
    header: "Last Active",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lastActiveAt
          ? formatDate(row.original.lastActiveAt)
          : "Not available"}
      </span>
    ),
  },
];
