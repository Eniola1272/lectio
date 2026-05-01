"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const schema = z.object({
  displayName: z
    .string()
    .min(2, "At least 2 characters")
    .max(40, "Max 40 characters"),
});
type FormData = z.infer<typeof schema>;

export function OnboardingForm({ userId }: { userId: string }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      display_name: data.displayName,
    });
    if (error) {
      setServerError(error.message);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          placeholder="e.g. Augustine"
          autoFocus
          {...register("displayName")}
        />
        {errors.displayName && (
          <p className="font-mono text-[10px] text-ochre">
            {errors.displayName.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="font-mono text-[10px]" style={{ color: "#c0392b" }}>
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Begin →"}
      </Button>
    </form>
  );
}
