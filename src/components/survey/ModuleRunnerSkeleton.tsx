import { Skeleton } from "@/components/ui/skeleton";

export function ModuleRunnerSkeleton() {
  return (
    <div className="fixed inset-0 z-100 flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-secondary p-2.5 sm:p-4">
      {/* Header Skeleton */}
      <div className="mb-2 shrink-0 px-1 py-1">
        <div className="mb-1.5 flex items-center justify-between">
          <Skeleton className="h-6 w-44 sm:w-56" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24 rounded-xs" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between overflow-hidden">
        <div className="space-y-3">
          {/* Question Type Tag Skeleton */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>

          {/* Question Card Skeleton */}
          <div className="flex min-h-[280px] sm:min-h-[320px] flex-col justify-between rounded-[24px] border border-black/10 bg-card p-6 shadow-md sm:p-8">
            <div className="my-auto flex flex-col items-center space-y-3 py-6 text-center">
              <Skeleton className="h-6 w-3/4 max-w-sm rounded-md" />
              <Skeleton className="h-5 w-1/2 max-w-xs rounded-md" />
            </div>

            <div className="flex w-full items-center justify-between pt-3">
              <Skeleton className="h-4 w-14 rounded-xs" />
              <Skeleton className="h-4 w-14 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Bottom Actions Skeleton */}
        <div className="mt-auto flex w-full flex-col gap-2.5 pt-3">
          <div className="flex items-center justify-center py-0.5">
            <Skeleton className="h-5 w-44 rounded-full" />
          </div>
          <div className="flex w-full gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
