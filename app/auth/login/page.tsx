"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { login } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginAdmin } from "@/lib/api/auth.api";
import { AUTH_TOKEN_KEY } from "@/lib/api/axios";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
});

type EmailForm = z.infer<typeof emailSchema>;
type FormErrors = Partial<Record<keyof EmailForm, string>>;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const dispatch = useDispatch();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (response, variables) => {
      const token = response.data?.token;

      if (!token) {
        return;
      }

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      dispatch(login({ token, email: variables.email }));
      router.push("/dashboard");
    },
  });

  const validateEmailField = (value: string) => {
    const result = emailSchema.shape.email.safeParse(value);

    setErrors((prev) => ({
      ...prev,
      email: result.success ? "" : result.error.issues[0]?.message,
    }));
  };

  const validateForm = (): boolean => {
    const result = emailSchema.safeParse({ email });

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof EmailForm;
      nextErrors[field] = issue.message;
    });
    setErrors(nextErrors);
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
          Sign In
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground text-pretty">
          Enter administrator credentials to authenticate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-[13px] font-medium text-foreground/80">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@theameyapp.com"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              validateEmailField(value);
            }}
            autoComplete="email"
            required
            className="h-9 text-[14px] bg-background/50 border-border/70 focus:border-primary transition-colors"
          />
          {errors.email && (
            <p className="text-[12px] text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-[13px] text-primary hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-9 text-[14px] pr-9 bg-background/50 border-border/70 focus:border-primary transition-colors"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {loginMutation.isError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2 text-[13px] text-destructive">
            {loginMutation.error.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-9 mt-1 text-[14px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 transition-all cursor-pointer rounded-md"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default Login;
