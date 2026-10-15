import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CompanyAnalytics } from "@/lib/types/company.type";

export function ModuleComplianceList({
  modules = [],
}: {
  modules?: CompanyAnalytics["moduleCompliance"];
}) {
  const moduleList = modules || [];

  return (
    <section className="overflow-hidden rounded-md border bg-card shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h2 className="font-bold text-sm sm:text-base text-foreground dark:text-white">Assigned Modules Compliance</h2>
        </div>
        <span className="text-xs text-muted-foreground dark:text-zinc-400 font-medium">
          {moduleList.length} {moduleList.length === 1 ? "module" : "modules"}
        </span>
      </div>
      <div className="space-y-3 p-4 overflow-y-auto flex-1">
        {moduleList.length > 0 ? (
          moduleList.map((module, index) => (
            <div
              key={`${module.moduleId}-${module.teamId}-${index}`}
              className="rounded-md border p-3.5 bg-muted/10 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="rounded bg-secondary/30 px-2 py-0.5 text-xs font-bold shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground dark:text-white">
                      {module.moduleName}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-zinc-400">
                      Team: {module.teamName}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">
                    {module.completionPercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-zinc-400">
                    {module.completedCount}/{module.totalAssigned} completed
                  </p>
                </div>
              </div>
              <Progress
                value={module.completionPercentage}
                className="mt-3 h-2"
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-48 py-8 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No assigned modules yet</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
              Assigned modules and completion progress will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
