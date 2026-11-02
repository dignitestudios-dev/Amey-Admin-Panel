"use client";

import { DollarSign } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";

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
    label: "Gross",
    color: "hsl(var(--primary))",
  },
  platformCommission: {
    label: "Commission",
    color: "#39db98",
  },
  netRevenue: {
    label: "Driver Net",
    color: "#9be8c8",
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
    <Card className="glass-card rounded-xl border border-border/40 p-4 transition-all duration-200 hover:border-primary/30">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <DollarSign className="size-3.5 text-cyan-500" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Revenue Breakdown
            </CardTitle>
            <span className="text-[13px] text-muted-foreground">({year})</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Gross fare, commission & driver payout
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCurrency(totals.totalRevenue)}
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-1">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart accessibilityLayer data={data} barGap={3}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-[13px] fill-muted-foreground font-medium"
            />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={54}
              tickMargin={6}
              className="text-[13px] fill-muted-foreground tabular-nums"
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
                value="USD"
                angle={-90}
                position="insideRight"
                offset={4}
                className="fill-muted-foreground text-[12px]"
              />
            </YAxis>
            <ChartTooltip
              cursor={{ fill: "rgba(12, 186, 112, 0.04)" }}
              content={<ChartTooltipContent indicator="dashed" className="glass-card text-xs shadow-md" />}
            />
            <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="platformCommission" fill="#39db98" radius={[3, 3, 0, 0]} maxBarSize={16} />
            <Bar dataKey="netRevenue" fill="#9be8c8" radius={[3, 3, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="p-0 pt-3 mt-3 border-t border-border/30 text-[13px] flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            Gross
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#39db98]" />
            Commission
          </span>
        </div>
        <span className="tabular-nums font-medium text-foreground">
          Take Rate: {totals.totalRevenue > 0 ? ((totals.platformCommission / totals.totalRevenue) * 100).toFixed(1) : 0}%
        </span>
      </CardFooter>
    </Card>
  );
}
