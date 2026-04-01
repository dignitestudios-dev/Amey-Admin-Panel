"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";

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

export const description = "A multiple bar chart";

export interface RevenueBarPoint {
  month: string;
  totalRevenue: number;
  platformCommission: number;
  netRevenue: number;
}

interface ChartBarMultipleProps {
  data: RevenueBarPoint[];
  year: number;
}

const chartConfig = {
  totalRevenue: {
    label: "Total Revenue",
    color: "var(--chart-1)",
  },
  platformCommission: {
    label: "Commission",
    color: "var(--chart-2)",
  },
  netRevenue: {
    label: "Net Revenue",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function ChartBarMultiple({ data, year }: ChartBarMultipleProps) {
  const totals = data.reduce(
    (accumulator, item) => ({
      totalRevenue: accumulator.totalRevenue + item.totalRevenue,
      platformCommission: accumulator.platformCommission + item.platformCommission,
      netRevenue: accumulator.netRevenue + item.netRevenue,
    }),
    { totalRevenue: 0, platformCommission: 0, netRevenue: 0 },
  );

  return (
    <Card className="border-primary/10 transition-colors hover:border-primary/30">
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Monthly revenue, commission, and net for {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={64}
              tickMargin={8}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            >
              <Label
                value="Dollars"
                angle={-92}
                position="insideRight"
                offset={6}
                className="fill-muted-foreground text-xs"
              />
            </YAxis>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={4} />
            <Bar dataKey="platformCommission" fill="var(--color-platformCommission)" radius={4} />
            <Bar dataKey="netRevenue" fill="var(--color-netRevenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t border-border/50 pt-4 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Revenue performance overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total: {formatCurrency(totals.totalRevenue)} · Commission: {formatCurrency(totals.platformCommission)} · Net: {formatCurrency(totals.netRevenue)}
        </div>
      </CardFooter>
    </Card>
  );
}
