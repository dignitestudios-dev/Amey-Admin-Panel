"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { RESET_EMAIL_KEY, sendResetOtp } from "@/lib/api/auth.api";
import { ArrowLeft, Loader2, Send } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const sendOtpMutation = useMutation({
    mutationFn: sendResetOtp,
    onSuccess: () => {
      localStorage.setItem(RESET_EMAIL_KEY, email.trim());
      router.push("/auth/verification");
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sendOtpMutation.mutate({ email: email.trim() });
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Enter your email address to receive a verification code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-foreground/90">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@theameyapp.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 text-xs bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-10 mt-2 text-xs font-medium bg-primary hover:bg-primary/90 text-white shadow-xs gap-2 transition-all cursor-pointer"
          disabled={sendOtpMutation.isPending}
        >
          {sendOtpMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Send OTP Code</span>
              <Send className="size-3.5" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
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

export default ForgotPassword;
