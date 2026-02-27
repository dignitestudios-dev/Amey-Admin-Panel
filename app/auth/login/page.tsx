"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
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
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be string",
    })
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              validateEmailField(value);
            }}
            autoComplete="email"
            required
          />
          {errors.email ? (
            <p className="text-xs text-red-600">{errors.email}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
              }}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {loginMutation.isError ? (
          <p className="text-sm text-red-600">{loginMutation.error.message}</p>
        ) : null}

        <div className="mt-6 text-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
