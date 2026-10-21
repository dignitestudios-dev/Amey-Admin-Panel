"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  entityLabel?: string;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  page,
  totalPages,
  limit,
  total,
  entityLabel = "records",
  isFetching = false,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  className,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = total > 0 ? Math.min(page * limit, total) : 0;

  const canGoPrev = page > 1;
  const canGoNext = page < safeTotalPages;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-3 text-xs sm:text-sm text-muted-foreground select-none",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
          <span className="font-medium text-foreground">{endRecord}</span> of{" "}
          <span className="font-medium text-foreground">{total.toLocaleString()}</span> {entityLabel}
        </span>
        {isFetching && (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium ml-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating...
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2">
          <Label htmlFor="table-page-size" className="text-xs text-muted-foreground whitespace-nowrap">
            Rows per page
          </Label>
          <Select
            value={String(limit)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              id="table-page-size"
              className="h-8 w-[72px] text-xs bg-background border-border/80 focus:ring-primary/20"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs font-medium text-foreground">
          Page {page} of {safeTotalPages}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/80 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="First page"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev || isFetching}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/80 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Previous page"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrev || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/80 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Next page"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/80 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Last page"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!canGoNext || isFetching}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
