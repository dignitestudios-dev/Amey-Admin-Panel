"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive" | "default";
  icon?: LucideIcon;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  icon: CustomIcon,
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const IconComponent =
    CustomIcon ||
    (variant === "destructive"
      ? AlertCircle
      : variant === "primary"
      ? CheckCircle2
      : HelpCircle);

  const iconColorClasses =
    variant === "destructive"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : variant === "primary"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border";

  const confirmButtonClass =
    variant === "destructive"
      ? "bg-red-600 hover:bg-red-700 text-white hover:text-white focus:ring-red-500/30"
      : variant === "primary"
      ? "bg-primary hover:bg-primary/90 text-white hover:text-white focus:ring-primary/30"
      : "bg-primary hover:bg-primary/90 text-white hover:text-white";

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px] p-6 rounded-2xl border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
        <AlertDialogHeader className="sm:place-items-start text-left gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                iconColorClasses
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-9 px-4 text-xs font-medium rounded-lg border-border bg-card text-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {cancelText}
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={cn(
              "h-9 px-4 text-xs font-medium rounded-lg text-white hover:text-white transition-colors shadow-xs",
              confirmButtonClass
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
