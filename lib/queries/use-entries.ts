"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Entry } from "@/lib/stats";

export function useEntries(userId: string) {
  return useQuery({
    queryKey: ["entries", userId],
    queryFn: async (): Promise<Entry[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_entries")
        .select("testament, book, chapter, read_at")
        .eq("user_id", userId)
        .order("read_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Entry[];
    },
    enabled: !!userId,
  });
}

export function useLogChapter(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testament,
      book,
      chapter,
    }: {
      testament: "old" | "new";
      book: string;
      chapter: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase.from("reading_entries").upsert(
        {
          user_id: userId,
          testament,
          book,
          chapter,
          read_at: new Date().toISOString().slice(0, 10),
        },
        { onConflict: "user_id,testament,book,chapter" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", userId] });
    },
  });
}
