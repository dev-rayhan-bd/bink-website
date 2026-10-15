import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardStats } from "@/lib/types/dashboard.type";

export type CompanyDashboardStats = {
  activeParticipants?: number;
  completionRate?: number;
  averageScore?: number;
  organizationGrade?: number;
};

interface DashboardStatsProps {
  data?: AdminDashboardStats;
  companyStats?: CompanyDashboardStats;
}

export function DashboardStats({ data, companyStats }: DashboardStatsProps) {
  let stats: Array<{
    title: string;
    value: string;
    suffix: string;
    bgColor: string;
    borderColor: string;
  }>;

  if (data) {
    stats = [
      {
        title: "Total Client Companies",
        value: data.totalClientCompanies.toLocaleString(),
        suffix: "Companies",
        bgColor: "bg-secondary/15 dark:bg-card",
        borderColor: "border-secondary/30 dark:border-border",
      },
      {
        title: "Active Employees",
        value: data.activeEmployees.toLocaleString(),
        suffix: "Employees",
        bgColor: "bg-primary/10 dark:bg-card",
        borderColor: "border-primary/30 dark:border-border",
      },
      {
        title: "Total Modules",
        value: data.totalModules.toLocaleString(),
        suffix: "Modules",
        bgColor: "bg-muted/40 dark:bg-card",
        borderColor: "border-border dark:border-border",
      },
    ];
  } else if (companyStats) {
    stats = [
      {
        title: "Active Participants",
        value: companyStats.activeParticipants?.toLocaleString() || "0",
        suffix: "Employees",
        bgColor: "bg-secondary/15 dark:bg-card",
        borderColor: "border-secondary/30 dark:border-border",
      },
      {
        title: "Completion Rate",
        value: `${companyStats.completionRate ?? 0}%`,
        suffix: "",
        bgColor: "bg-primary/10 dark:bg-card",
        borderColor: "border-primary/30 dark:border-border",
      },
      {
        title: "Average Score",
        value: `${companyStats.averageScore ?? 0}%`,
        suffix: "",
        bgColor: "bg-emerald-500/10 dark:bg-card",
        borderColor: "border-emerald-500/30 dark:border-border",
      },
      {
        title: "Organization Grade",
        value: `${companyStats.organizationGrade ?? 0}`,
        suffix: "",
        bgColor: "bg-muted/40 dark:bg-card",
        borderColor: "border-border dark:border-border",
      },
    ];
  } else {
    stats = [
      {
        title: "Active Participants",
        value: "0",
        suffix: "Employees",
        bgColor: "bg-secondary/15 dark:bg-card",
        borderColor: "border-secondary/30 dark:border-border",
      },
      {
        title: "Completion Rate",
        value: "0%",
        suffix: "",
        bgColor: "bg-primary/10 dark:bg-card",
        borderColor: "border-primary/30 dark:border-border",
      },
      {
        title: "Average Score",
        value: "0%",
        suffix: "",
        bgColor: "bg-emerald-500/10 dark:bg-card",
        borderColor: "border-emerald-500/30 dark:border-border",
      },
      {
        title: "Organization Grade",
        value: "0",
        suffix: "",
        bgColor: "bg-muted/40 dark:bg-card",
        borderColor: "border-border dark:border-border",
      },
    ];
  }

  const isFourCards = !data;

  return (
    <div
      className={`grid gap-4 ${
        isFourCards
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 md:grid-cols-3"
      }`}
    >
      {stats.map((stat, i) => (
        <Card
          key={i}
          className={`${stat.bgColor} ${stat.borderColor} border shadow-xs transition-all hover:border-primary/40`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground dark:text-zinc-300 tracking-wider uppercase">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2">
            <div className="text-3xl sm:text-4xl font-bold font-heading text-foreground dark:text-white">
              {stat.value}
            </div>
            {stat.suffix && (
              <span className="text-xs font-medium text-muted-foreground dark:text-zinc-400">
                {stat.suffix}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
