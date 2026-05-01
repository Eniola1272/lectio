"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const supabase = createClient();

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        setServerError(error.message);
      } else {
        window.location.href = "/";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        ...data,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setServerError(error.message);
      } else {
        setSuccess(true);
      }
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="text-center py-4" style={{ color: "#5a4023" }}>
        <div className="font-serif italic text-xl mb-2">Check your inbox.</div>
        <div className="font-mono text-xs tracking-wider" style={{ color: "#7a5d3a" }}>
          We sent a confirmation link to your email.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="font-mono text-[10px] text-ochre">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="font-mono text-[10px] text-ochre">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="font-mono text-[10px]" style={{ color: "#c0392b" }}>
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "..."
          : mode === "signin"
          ? "Sign In →"
          : "Create Account →"}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "#d4be96" }} />
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#a89070" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: "#d4be96" }} />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
        Continue with Google
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="w-full font-mono text-[10px] tracking-widest uppercase text-center"
        style={{ color: "#7a5d3a" }}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
