"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Testament } from "@/lib/bible";

export interface ProgressRow {
  user_id: string;
  ot_book: string | null;
  ot_chapter: number | null;
  ot_chapter_index: number | null;
  nt_book: string | null;
  nt_chapter: number | null;
  nt_chapter_index: number | null;
  updated_at: string;
}

export interface HistoryRow {
  id: string;
  user_id: string;
  testament: Testament;
  book: string;
  chapter: number;
  chapter_index: number;
  recorded_at: string;
}

export function useProgress(userId: string, initialData?: ProgressRow | null) {
  return useQuery({
    queryKey: ["progress", userId],
    queryFn: async (): Promise<ProgressRow | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data ?? null;
    },
    initialData: initialData ?? undefined,
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
      testament,
      book,
      chapter,
      chapter_index,
    }: {
      testament: Testament;
      book: string;
      chapter: number;
      chapter_index: number;
    }) => {
      const supabase = createClient();

      // Upsert only the testament-specific fields — the other bookmark is untouched
      const payload =
        testament === "old"
          ? { user_id: userId, ot_book: book, ot_chapter: chapter, ot_chapter_index: chapter_index }
          : { user_id: userId, nt_book: book, nt_chapter: chapter, nt_chapter_index: chapter_index };

      const { error: upsertErr } = await supabase
        .from("reading_progress")
        .upsert(payload, { onConflict: "user_id" });
      if (upsertErr) throw upsertErr;

      const { error: histErr } = await supabase
        .from("progress_history")
        .insert({ user_id: userId, testament, book, chapter, chapter_index });
      if (histErr) throw histErr;
    },

    // Optimistic update — UI reflects the new bookmark immediately
    onMutate: async ({ testament, book, chapter, chapter_index }) => {
      await queryClient.cancelQueries({ queryKey: ["progress", userId] });
      const previous = queryClient.getQueryData<ProgressRow | null>(["progress", userId]);

      queryClient.setQueryData<ProgressRow | null>(["progress", userId], (old) => {
        const base: ProgressRow = old ?? {
          user_id: userId,
          ot_book: null,
          ot_chapter: null,
          ot_chapter_index: null,
          nt_book: null,
          nt_chapter: null,
          nt_chapter_index: null,
          updated_at: new Date().toISOString(),
        };
        return testament === "old"
          ? { ...base, ot_book: book, ot_chapter: chapter, ot_chapter_index: chapter_index }
          : { ...base, nt_book: book, nt_chapter: chapter, nt_chapter_index: chapter_index };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["progress", userId], context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress-history", userId] });
    },
  });
}
