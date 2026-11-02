"use client";

import type { ComponentType, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Shared table styling used across the dashboard (riders-style ledger). */
export const thClass =
  "h-11 px-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground";
export const tdClass = "px-4 py-3";

export function TableCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      {title && (
        <div className="border-b border-border px-5 pt-4 pb-3">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-[14px] text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">{children}</div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg pl-9 text-[14px]"
      />
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/** Pill-style dropdown filter: icon + current value, like the Tier / City chips. */
export function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  className?: string;
}) {
  const active = options[0]?.value !== value;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-10 min-w-[140px] rounded-lg text-[14px]",
          active && "border-primary/50 bg-primary/10 text-primary",
          className,
        )}
      >
        {Icon && <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function StatusTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-[14px] font-medium transition-colors",
            value === t.id
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cn("text-[12px] tnum", value === t.id ? "text-primary" : "text-muted-foreground/70")}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneText: Record<Tone, string> = {
  success: "text-primary",
  warning: "text-amber-400",
  danger: "text-destructive",
  info: "text-sky-400",
  neutral: "text-muted-foreground",
};
const toneDot: Record<Tone, string> = {
  success: "bg-primary",
  warning: "bg-amber-400",
  danger: "bg-destructive",
  info: "bg-sky-400",
  neutral: "bg-muted-foreground/50",
};

export function StatusDot({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] font-medium capitalize", toneText[tone])}>
      <span className={cn("size-2 rounded-full", toneDot[tone])} />
      {children}
    </span>
  );
}

export function InitialAvatar({ name, className }: { name?: string | null; className?: string }) {
  const initials =
    (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary",
        className,
      )}
    >
      {initials}
    </span>
  );
}

function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const lo = Math.max(2, page - 1);
  const hi = Math.min(total - 1, page + 1);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function PageFooter({
  shown,
  total,
  page,
  totalPages,
  limit,
  pageSizes = [10, 20, 50],
  noun,
  disabled,
  onPage,
  onPageSize,
}: {
  shown: number;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  pageSizes?: number[];
  noun: string;
  disabled?: boolean;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const pages = Math.max(totalPages, 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : (page - 1) * limit + shown;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-[14px]">
      <span className="text-muted-foreground tnum">
        Showing {from}–{to} of {total.toLocaleString()} {noun}
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">Rows</span>
          <Select value={String(limit)} onValueChange={(v) => onPageSize(Number(v))}>
            <SelectTrigger className="h-9 w-[76px] rounded-lg text-[14px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || disabled}
            onClick={() => onPage(page - 1)}
            className="h-9 rounded-lg px-2.5"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          {pageWindow(page, pages).map((n, i) =>
            n === "…" ? (
              <span key={`e${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPage(n)}
                className={cn(
                  "size-9 cursor-pointer rounded-lg text-[14px] font-medium tnum transition-colors",
                  n === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {n}
              </button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages || disabled}
            onClick={() => onPage(page + 1)}
            className="h-9 rounded-lg px-2.5"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TableMessage({ children, tone }: { children: ReactNode; tone?: "error" }) {
  return (
    <div
      className={cn(
        "px-5 py-14 text-center text-[14px]",
        tone === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}
