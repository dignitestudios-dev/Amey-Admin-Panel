"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getDashboardOverview } from "@/lib/api/states.api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CarTaxiFront, ChevronRight, Download, MapPin, Route, Users } from "lucide-react";
import { FilterBar, StatusDot, TableCard, TableMessage, tdClass, thClass } from "@/components/data-table-ui";
import { cn } from "@/lib/utils";

const stateCodeMap: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

/**
 * The states endpoint (/admin/dashboard-overview) returns every state in one
 * response and accepts no search, sort, filter or pagination params, so rows
 * are rendered exactly as the API returns them.
 */
export default function StatesOverviewTable() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const totals = useMemo(
    () => ({
      states: rows.length,
      rides: rows.reduce((a, r) => a + r.totalRides, 0),
      drivers: rows.reduce((a, r) => a + r.drivers, 0),
      riders: rows.reduce((a, r) => a + r.passengers, 0),
      active: rows.reduce((a, r) => a + r.activeRides, 0),
    }),
    [rows],
  );

  const getCode = (state: string) => stateCodeMap[state] || state.slice(0, 2).toUpperCase();
  const shareOf = (rides: number) => (totals.rides > 0 ? (rides / totals.rides) * 100 : 0);

  const exportCsv = () => {
    const head = ["State", "Code", "Completed trips", "Fleet", "Riders", "In transit", "Volume share %"];
    const lines = rows.map((r) =>
      [
        r.state,
        getCode(r.state),
        r.totalRides,
        r.drivers,
        r.passengers,
        r.activeRides,
        shareOf(r.totalRides).toFixed(1),
      ].join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amey-states.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const go = (path: string, state: string, extra = "") =>
    router.push(`/dashboard/${path}?state=${encodeURIComponent(state)}${extra}`);

  const stats = [
    { label: "Licensed zones", value: totals.states, hint: "Operating jurisdictions", icon: MapPin },
    { label: "Completed trips", value: totals.rides, hint: "Across all territories", icon: Route },
    { label: "Active fleet", value: totals.drivers, hint: "Assigned drivers", icon: CarTaxiFront },
    { label: "Riders", value: totals.riders, hint: `${totals.active} in transit now`, icon: Users },
  ];

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                {s.label}
              </span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-[28px] font-semibold leading-none tracking-tight tnum">
              {s.value.toLocaleString()}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <TableCard
        title="Operating zones"
        subtitle="Every licensed state with trip volume, fleet and live dispatch"
      >
        <FilterBar>
          <span className="text-[13px] text-muted-foreground tnum">{rows.length} zones</span>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="ml-auto h-10 rounded-lg px-3 text-[14px]"
          >
            <Download className="size-4" />
            Export
          </Button>
        </FilterBar>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, n) => (
              <div key={n} className="h-14 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : error ? (
          <TableMessage tone="error">Failed to load territory metrics. Please retry.</TableMessage>
        ) : rows.length === 0 ? (
          <TableMessage>No operating zones found.</TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-[14px]">
              <thead>
                <tr className="border-b border-border">
                  <th className={`${thClass} text-left`}>State</th>
                  <th className={`${thClass} text-left`}>Status</th>
                  <th className={`${thClass} text-right`}>Trips</th>
                  <th className={`${thClass} text-right`}>Fleet</th>
                  <th className={`${thClass} text-right`}>Riders</th>
                  <th className={`${thClass} text-right`}>In transit</th>
                  <th className={`${thClass} w-[200px] text-left`}>Volume share</th>
                  <th className={`${thClass} w-12`} />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const code = getCode(row.state);
                  const live = row.activeRides > 0;
                  const share = shareOf(row.totalRides);
                  return (
                    <tr
                      key={row.state}
                      onClick={() => go("rides", row.state)}
                      className="group cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60"
                    >
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[13px] font-bold text-primary">
                            {code}
                          </span>
                          <div className="min-w-0 leading-tight">
                            <span className="font-semibold text-foreground">{row.state}</span>
                            <p className="text-[12px] text-muted-foreground">Zone {code}-US</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <StatusDot tone={live ? "success" : "neutral"}>{live ? "Live" : "Standby"}</StatusDot>
                      </td>
                      <td className={`${tdClass} text-right font-semibold tnum`}>{row.totalRides.toLocaleString()}</td>
                      <td className={`${tdClass} text-right tnum`}>{row.drivers.toLocaleString()}</td>
                      <td className={`${tdClass} text-right tnum`}>{row.passengers.toLocaleString()}</td>
                      <td
                        className={cn(
                          tdClass,
                          "text-right tnum",
                          live ? "font-semibold text-primary" : "text-muted-foreground",
                        )}
                      >
                        {row.activeRides}
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${share > 0 ? Math.max(share, 4) : 0}%` }}
                            />
                          </div>
                          <span className="text-[13px] text-muted-foreground tnum">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className={`${tdClass} text-right`} onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Open ${row.state} actions`}
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              <ChevronRight className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => go("drivers", row.state)}>
                              Fleet ({row.drivers})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => go("rides", row.state)}>
                              Trips ({row.totalRides})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => go("users", row.state)}>
                              Riders ({row.passengers})
                            </DropdownMenuItem>
                            {live && (
                              <DropdownMenuItem onClick={() => go("ongoing-rides", row.state, "&status=active")}>
                                Live dispatch ({row.activeRides})
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TableCard>
    </div>
  );
}
