import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurrentUser } from "@/lib/types/user.type";
import { getInitials } from "@/lib/utils";

export function ProfileCard({
  user,
  isLoading,
}: {
  user: CurrentUser | null;
  isLoading: boolean;
}) {
  if (isLoading) return <ProfileCardSkeleton />;

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    "Deelnemer";

  const email = user?.role === "user" ? user.email : null;
  const image = user?.role === "user" ? user.image : null;

  return (
    <div className="mb-8 rounded-sm bg-secondary/90 p-5 shadow-sm">
      <div className="flex gap-4">
        <Avatar className="mt-1 size-14">
          {image && <AvatarImage src={image} alt={displayName} />}
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-bold leading-tight">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-[11px] font-medium text-foreground/80">
            {email || "Geen e-mailadres beschikbaar"}
          </p>
          <p className="mt-1 text-[10px] capitalize tracking-wide text-foreground/60">
            {user?.authType ? `${user.authType}-account` : "Leerprogramma"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="mb-8 rounded-sm bg-secondary/90 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-full bg-background/55" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32 bg-background/55" />
          <Skeleton className="h-3 w-48 max-w-full bg-background/45" />
          <Skeleton className="h-2.5 w-24 bg-background/40" />
        </div>
      </div>
    </div>
  );
}
