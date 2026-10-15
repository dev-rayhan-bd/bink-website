"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BehavioralChartProps {
  data?: Array<{ name: string; baseline: number; followUp: number }>;
  averageIncrease?: number;
}

const chartConfig = {
  baseline: {
    label: "Baseline",
    color: "var(--secondary)",
  },
  followUp: {
    label: "Follow-up",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function BehavioralChart({
  data = [],
  averageIncrease = 0,
}: BehavioralChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 bg-card border border-border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <CardTitle className="text-lg font-bold font-heading uppercase tracking-wide text-foreground dark:text-white">
          BEHAVIORAL CHANGE OVER TIME
        </CardTitle>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-sm" />
            <span className="text-muted-foreground dark:text-zinc-300">Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-muted-foreground dark:text-zinc-300">Follow-up</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barGap={0}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.6}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12, fontWeight: 500 }}
                className="text-foreground dark:text-zinc-200"
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="baseline"
                fill="var(--secondary)"
                radius={[2, 2, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="followUp"
                fill="var(--primary)"
                radius={[2, 2, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="mt-6 inline-block">
          <div className="bg-secondary/20 text-secondary-foreground dark:text-zinc-200 px-3 py-1.5 rounded-md text-sm font-medium border border-secondary/30">
            Average score increase: +{averageIncrease}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
