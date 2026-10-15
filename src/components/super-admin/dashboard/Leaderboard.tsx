import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

export type LeaderboardItem = {
  id: string;
  name: string;
  points: number;
  isTop?: boolean;
};

export function Leaderboard({ data }: { data?: LeaderboardItem[] }) {
  const leaderboardData = data || [];

  return (
    <Card className="col-span-1 bg-secondary/30 border-none shadow-none h-full rounded-sm overflow-hidden flex flex-col pt-0">
      <CardHeader className="pt-5 pb-4 px-4 bg-secondary/20 border-b border-secondary/20">
        <CardTitle className="text-sm font-bold font-heading uppercase tracking-wide leading-tight">
          EMPLOYEE PERFORMANCE<br />LEADERBOARD
        </CardTitle>
      </CardHeader>
      <ScrollArea className="overflow-y-auto flex-1">
        <CardContent className="p-0">
          {leaderboardData.length > 0 ? (
            <div className="flex flex-col">
              {leaderboardData.map((user, i) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between py-3 px-4 hover:bg-secondary/20 transition-colors ${
                    i !== leaderboardData.length - 1
                      ? "border-b border-secondary/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-sm ${
                        user.isTop
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/30 text-secondary-foreground"
                      }`}
                    >
                      {user.id}
                    </span>
                    <span className="text-xs font-bold tracking-wide">
                      {user.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-sm font-bold">{user.points}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 p-6 text-center text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">No leaderboard data available</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
