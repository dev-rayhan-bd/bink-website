import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-foreground dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base font-medium text-muted-foreground dark:text-zinc-300">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
