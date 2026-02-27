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
      setInfo("A new OTP has been sent.");
      inputRefs.current[0]?.focus();
    },
    onError: (mutationError: Error) => {
      setInfo("");
      setError(mutationError.message);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Limit to single digit
    if (value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];
      if (otp[index]) {
        // Clear current input
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Auto focus to previous input
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    setError("");

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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We have sent a 6-digit code to your email address. Enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-12 h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {displayError ? <p className="text-sm text-red-600">{displayError}</p> : null}
        {info ? <p className="text-sm text-green-600">{info}</p> : null}

        <div className="text-right">
          <button
            type="button"
            className="text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleResendOtp}
            disabled={isDisabled || !email}
          >
            {isResending ? "Resending..." : "Resend"}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={otpExpired || !isComplete || isDisabled}
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Verification;
