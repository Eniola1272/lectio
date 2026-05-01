"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface ProgressRow {
  user_id: string;
  book: string;
  chapter: number;
  chapter_index: number;
  updated_at: string;
}

export interface HistoryRow {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  chapter_index: number;
  recorded_at: string;
}

export function useProgress(userId: string) {
  return useQuery({
    queryKey: ["progress", userId],
    queryFn: async (): Promise<ProgressRow | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data ?? null;
    },
    enabled: !!userId,
  });
}

export function useProgressHistory(userId: string) {
  return useQuery({
    queryKey: ["progress-history", userId],
    queryFn: async (): Promise<HistoryRow[]> => {
      const supabase = createClient();
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from("progress_history")
        .select("*")
        .eq("user_id", userId)
        .gte("recorded_at", since.toISOString())
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSetProgress(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      book,
      chapter,
      chapter_index,
    }: {
      book: string;
      chapter: number;
      chapter_index: number;
    }) => {
      const supabase = createClient();
      // Upsert current position
      const { error: upsertErr } = await supabase
        .from("reading_progress")
        .upsert(
          { user_id: userId, book, chapter, chapter_index },
          { onConflict: "user_id" }
        );
      if (upsertErr) throw upsertErr;

      // Append to history
      const { error: histErr } = await supabase
        .from("progress_history")
        .insert({ user_id: userId, book, chapter, chapter_index });
      if (histErr) throw histErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress-history", userId] });
    },
  });
}
