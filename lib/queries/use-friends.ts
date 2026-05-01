"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface FriendProfile {
  id: string;
  display_name: string;
}

export interface FriendWithProgress extends FriendProfile {
  chapter_index: number;
  history: { chapter_index: number; recorded_at: string }[];
}

export interface PendingRequest {
  user_a: string;
  user_b: string;
  requested_by: string;
  created_at: string;
  profile: FriendProfile;
}

export function useFriends(userId: string) {
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: async (): Promise<FriendWithProgress[]> => {
      const supabase = createClient();

      const { data: friendships, error: fErr } = await supabase
        .from("friendships")
        .select("user_a, user_b")
        .eq("status", "accepted")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);
      if (fErr) throw fErr;

      const friendIds = (friendships ?? []).map((f) =>
        f.user_a === userId ? f.user_b : f.user_a
      );
      if (!friendIds.length) return [];

      const [{ data: profiles, error: pErr }, { data: positions, error: posErr }, { data: histories, error: hErr }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", friendIds),
          supabase
            .from("reading_progress")
            .select("user_id, chapter_index")
            .in("user_id", friendIds),
          supabase
            .from("progress_history")
            .select("user_id, chapter_index, recorded_at")
            .in("user_id", friendIds)
            .gte(
              "recorded_at",
              new Date(Date.now() - 30 * 86400000).toISOString()
            )
            .order("recorded_at", { ascending: true }),
        ]);

      if (pErr) throw pErr;
      if (posErr) throw posErr;
      if (hErr) throw hErr;

      return (profiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        chapter_index:
          positions?.find((pos) => pos.user_id === p.id)?.chapter_index ?? 0,
        history: (histories ?? [])
          .filter((h) => h.user_id === p.id)
          .map((h) => ({ chapter_index: h.chapter_index, recorded_at: h.recorded_at })),
      }));
    },
    enabled: !!userId,
  });
}

export function usePendingRequests(userId: string) {
  return useQuery({
    queryKey: ["pending-requests", userId],
    queryFn: async (): Promise<PendingRequest[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("friendships")
        .select("user_a, user_b, requested_by, created_at")
        .eq("status", "pending")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);
      if (error) throw error;

      const incoming = (data ?? []).filter((r) => r.requested_by !== userId);
      if (!incoming.length) return [];

      const requesterIds = incoming.map((r) => r.requested_by);
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", requesterIds);
      if (pErr) throw pErr;

      return incoming.map((r) => ({
        ...r,
        profile: (profiles ?? []).find((p) => p.id === r.requested_by) ?? {
          id: r.requested_by,
          display_name: "Unknown",
        },
      }));
    },
    enabled: !!userId,
  });
}

export function useSendFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const supabase = createClient();
      const [a, b] = [userId, targetId].sort();
      const { error } = await supabase.from("friendships").insert({
        user_a: a,
        user_b: b,
        status: "pending",
        requested_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-requests", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends", userId] });
    },
  });
}

export function useAcceptFriendRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_a,
      user_b,
    }: {
      user_a: string;
      user_b: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("user_a", user_a)
        .eq("user_b", user_b);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", userId] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests", userId] });
    },
  });
}

export function useSearchUsers(query: string, userId: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: async (): Promise<FriendProfile[]> => {
      if (!query.trim()) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name")
        .ilike("display_name", `%${query}%`)
        .neq("id", userId)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: query.length >= 2,
  });
}
