"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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

export const description = "A stacked area chart";

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
    color: "var(--chart-1)",
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

  return (
    <Card className="border-primary/10 transition-colors hover:border-primary/30">
      <CardHeader>
        <CardTitle>Rides Activity</CardTitle>
        <CardDescription>Monthly rides trend for {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={56}
              tickMargin={8}
            >
              <Label
                value="Rides"
                angle={-90}
                position="insideRight"
                offset={-2}
                className="fill-muted-foreground text-xs"
              />
            </YAxis>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="totalRides"
              type="monotone"
              stroke="var(--color-totalRides)"
              strokeWidth={3}
              dot={{ r: 3, fill: "var(--color-totalRides)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t border-border/50 pt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trend.startsWith("-") ? "Down" : "Up"} {Math.abs(Number(trend))}% from start of year <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Total rides: {totalRides.toLocaleString("en-US")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
