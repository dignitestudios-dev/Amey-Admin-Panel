"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  RESET_EMAIL_KEY,
  RESET_TOKEN_KEY,
  resetPassword,
} from "@/lib/api/auth.api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(RESET_TOKEN_KEY) ?? "";
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!resetToken) {
      router.replace("/auth/verification");
    }
  }, [resetToken, router]);

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      localStorage.removeItem(RESET_TOKEN_KEY);
      localStorage.removeItem(RESET_EMAIL_KEY);
      router.replace("/auth/login");
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError(
        "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Reset session expired. Please verify OTP again.");
      router.replace("/auth/verification");
      return;
    }

    resetPasswordMutation.mutate({ newPassword: password, resetToken });
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Set New Password
        </h2>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Create a secure password to protect your admin access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium text-foreground/90">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 text-xs pr-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground/90">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-10 text-xs pr-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-10 mt-2 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-xs gap-2 transition-all cursor-pointer"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving Password...</span>
            </>
          ) : (
            <>
              <KeyRound className="size-3.5" />
              <span>Update Password</span>
            </>
          )}
        </Button>

        <div className="text-center pt-1">
          <Link
            href="/auth/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel and return to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
