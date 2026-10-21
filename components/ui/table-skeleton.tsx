"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

export function TableSkeleton({
  columns,
  rows = 5,
  showAvatar = true,
  className,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className={className}>
          {Array.from({ length: columns }).map((_, colIndex) => {
            // First column: if showAvatar, render avatar circle + 2 lines of text
            if (colIndex === 0 && showAvatar) {
              return (
                <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1 max-w-[180px]">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </TableCell>
              );
            }

            // Middle column: simulate badge or chip
            if (colIndex === 1) {
              return (
                <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`}>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
              );
            }

            // Last column: simulate action button
            if (colIndex === columns - 1) {
              return (
                <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`} className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </TableCell>
              );
            }

            // Other columns: varied text skeletons
            const widthClasses = [
              "w-20",
              "w-24",
              "w-16",
              "w-28",
              "w-14",
            ];
            const widthClass = widthClasses[(rowIndex + colIndex) % widthClasses.length];

            return (
              <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`}>
                <Skeleton className={`h-4 ${widthClass}`} />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
