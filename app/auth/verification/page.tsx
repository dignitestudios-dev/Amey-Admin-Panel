"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  RESET_EMAIL_KEY,
  RESET_TOKEN_KEY,
  sendResetOtp,
  verifyResetOtp,
} from "@/lib/api/auth.api";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const Verification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(RESET_EMAIL_KEY) ?? "";
  });
  const [existingResetToken, setExistingResetToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(RESET_TOKEN_KEY) ?? "";
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const otpExpired = !email || Boolean(existingResetToken);

  const verifyOtpMutation = useMutation({
    mutationFn: verifyResetOtp,
    onSuccess: (response) => {
      localStorage.setItem(RESET_TOKEN_KEY, response.token);
      localStorage.removeItem(RESET_EMAIL_KEY);
      router.replace("/auth/reset-password");
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: sendResetOtp,
    onSuccess: () => {
      localStorage.removeItem(RESET_TOKEN_KEY);
      setExistingResetToken("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setInfo("A new verification code has been dispatched.");
      inputRefs.current[0]?.focus();
    },
    onError: (mutationError: Error) => {
      setInfo("");
      setError(mutationError.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const otpCode = otp.join("");

    if (otpExpired) {
      setError("OTP Expired");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    if (!email) {
      setError("Email is missing. Please request OTP again.");
      router.replace("/auth/forgot-password");
      return;
    }

    verifyOtpMutation.mutate({ email, otpCode });
  };

  const handleResendOtp = () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("OTP Expired");
      return;
    }

    resendOtpMutation.mutate({ email });
  };

  const isComplete = otp.every((digit) => digit !== "");
  const isResending = resendOtpMutation.isPending;
  const isDisabled = isResending || verifyOtpMutation.isPending;
  const displayError = error || (otpExpired ? "OTP Expired" : "");

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Enter Security Code
        </h2>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{email || "your email"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isResending}
              className="size-11 text-center text-lg font-mono font-bold bg-background/50 border border-border/60 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {displayError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive text-center">
            {displayError}
          </div>
        )}

        {info && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            <span>{info}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Didn&apos;t receive code?</span>
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50 cursor-pointer"
            onClick={handleResendOtp}
            disabled={isDisabled || !email}
          >
            {isResending ? "Resending..." : "Resend Code"}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-10 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-xs gap-2 transition-all cursor-pointer"
          disabled={otpExpired || !isComplete || isDisabled}
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify & Proceed</span>
          )}
        </Button>

        <div className="text-center pt-1">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Verification;
