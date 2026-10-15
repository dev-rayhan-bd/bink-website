"use client";

import { Users, TrendingUp, Award } from "lucide-react";

export function StatCards({
  activeParticipants,
  completionRate,
  organizationGrade,
}: {
  activeParticipants: number;
  completionRate: number;
  organizationGrade: number;
}) {
const stats = [
  {
    label: "Active Participants",
    value: activeParticipants.toLocaleString(),
    suffix: "employees",
    icon: Users,
    color: "from-primary/10 to-primary/5",
    border: "border-primary/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Completion Rate",
    value: `${completionRate}%`,
    suffix: "Completed",
    icon: TrendingUp,
    color: "from-secondary/10 to-secondary/5",
    border: "border-secondary/10",
    iconBg: "bg-secondary/30 text-secondary",
  },
  {
    label: "Organization Grade",
    value: organizationGrade.toString(),
    suffix: "/10",
    icon: Award,
    color: "from-success/10 to-success/5",
    border: "border-success/10",
    iconBg: "bg-success/10 text-success",
  },
];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative bg-linear-to-br ${stat.color} border ${stat.border} p-5 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.suffix}
                  </span>
                </div>
              </div>
              <div className={`p-2.5 ${stat.iconBg} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
