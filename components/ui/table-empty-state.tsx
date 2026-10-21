"use client";

import * as React from "react";
import {
  SearchX,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  colSpan?: number;
}

export function TableEmptyState({
  icon: Icon = SearchX,
  title = "No results found",
  description = "We couldn't find any data matching your current filters or search term.",
  actionLabel,
  onAction,
  className,
  colSpan,
}: TableEmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-14 px-4 text-center max-w-md mx-auto animate-in fade-in-50 duration-200",
        className
      )}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute -inset-2 rounded-full bg-primary/10 blur-sm" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 border-border/80 hover:bg-muted font-medium text-xs h-9 px-4 rounded-lg shadow-2xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (typeof colSpan === "number") {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colSpan} className="p-0">
          {content}
        </TableCell>
      </TableRow>
    );
  }

  return content;
}

interface TableErrorStateProps {
  title?: string;
  error?: string | null;
  onRetry?: () => void;
  colSpan?: number;
  className?: string;
}

export function TableErrorState({
  title = "Failed to load data",
  error = "An error occurred while fetching information. Please try again.",
  onRetry,
  colSpan,
  className,
}: TableErrorStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-14 px-4 text-center max-w-md mx-auto animate-in fade-in-50 duration-200",
        className
      )}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute -inset-2 rounded-full bg-destructive/10 blur-sm" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {error || "An error occurred while fetching data."}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 border-destructive/30 hover:bg-destructive/10 text-destructive font-medium text-xs h-9 px-4 rounded-lg shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );

  if (typeof colSpan === "number") {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colSpan} className="p-0">
          {content}
        </TableCell>
      </TableRow>
    );
  }

  return content;
}
