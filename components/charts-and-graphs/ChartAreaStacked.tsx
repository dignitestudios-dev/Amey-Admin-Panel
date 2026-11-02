"use client";

import { TrendingDown, TrendingUp, Route } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface RidesLinePoint {
  month: string;
  totalRides: number;
}

interface ChartAreaStackedProps {
  data: RidesLinePoint[];
  year: number;
}

const chartConfig = {
  totalRides: {
    label: "Rides",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const calculateTrend = (data: RidesLinePoint[]): string => {
  if (data.length < 2) {
    return "0";
  }

  const first = data[0]?.totalRides ?? 0;
  const last = data[data.length - 1]?.totalRides ?? 0;

  if (first === 0) {
    return last > 0 ? "100" : "0";
  }

  return (((last - first) / first) * 100).toFixed(1);
};

export function ChartAreaStacked({ data, year }: ChartAreaStackedProps) {
  const totalRides = data.reduce((sum, item) => sum + item.totalRides, 0);
  const trend = calculateTrend(data);
  const isPositive = !trend.startsWith("-");

  return (
    <Card className="glass-card rounded-xl border border-border/40 p-4 transition-all duration-200 hover:border-primary/30">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Route className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Rides Volume
            </CardTitle>
            <span className="text-[13px] text-muted-foreground">({year})</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Monthly trip progression
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
          {totalRides.toLocaleString("en-US")} total
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-1">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 4,
              right: 8,
              top: 6,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="ridesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-[13px] fill-muted-foreground font-medium"
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={42}
              tickMargin={6}
              className="text-[13px] fill-muted-foreground tabular-nums"
            >
              <Label
                value="Trips"
                angle={-90}
                position="insideRight"
                offset={-2}
                className="fill-muted-foreground text-[12px]"
              />
            </YAxis>
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="dot" className="glass-card text-xs shadow-md" />}
            />
            <Area
              dataKey="totalRides"
              type="natural"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#ridesAreaGradient)"
              activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "#ffffff", strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="p-0 pt-3 mt-3 border-t border-border/30 text-[13px] flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-1 font-medium">
          {isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              +{trend}%
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-rose-500">
              <TrendingDown className="size-3" />
              {trend}%
            </span>
          )}
          <span>vs year start</span>
        </div>
        <span className="tabular-nums">Avg: {Math.round(totalRides / 12).toLocaleString("en-US")} / mo</span>
      </CardFooter>
    </Card>
  );
}
