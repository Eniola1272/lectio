"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/section-title";
import { CumulativeLineChart } from "@/components/charts/cumulative-line-chart";
import {
  useFriends,
  usePendingRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useSearchUsers,
} from "@/lib/queries/use-friends";
import { TOTAL_CH } from "@/lib/bible";
import { UserPlus, Check } from "lucide-react";

interface HistoryPoint {
  chapter_index: number;
  recorded_at: string;
}

interface FriendsViewProps {
  userId: string;
  myDisplayName: string;
  myChapterIndex: number;
  myHistory: HistoryPoint[];
}

export function FriendsView({
  userId,
  myDisplayName,
  myChapterIndex,
  myHistory,
}: FriendsViewProps) {
  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading: loadingFriends } = useFriends(userId);
  const { data: pendingRequests = [] } = usePendingRequests(userId);
  const { data: searchResults = [] } = useSearchUsers(search, userId);
  const sendRequest = useSendFriendRequest(userId);
  const acceptRequest = useAcceptFriendRequest(userId);

  // Leaderboard: me + accepted friends, ranked by chapter_index
  const leaderboard = [
    {
      id: userId,
      display_name: myDisplayName,
      chapter_index: myChapterIndex,
      isMe: true,
    },
    ...friends.map((f) => ({
      id: f.id,
      display_name: f.display_name,
      chapter_index: f.chapter_index,
      isMe: false,
    })),
  ].sort((a, b) => b.chapter_index - a.chapter_index);

  // Comparison chart: position (chapter_index) over last 30 days
  const days: string[] = [];
  for (let d = 29; d >= 0; d--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    days.push(dt.toISOString().slice(0, 10));
  }

  function posOnDay(
    history: HistoryPoint[],
    endOfDay: string
  ): number {
    return history
      .filter((h) => h.recorded_at <= endOfDay)
      .reduce((max, h) => Math.max(max, h.chapter_index), 0);
  }

  const chartData = days.map((date) => {
    const endOfDay = date + "T23:59:59";
    const label = new Date(date + "T12:00:00").toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });
    const point: Record<string, string | number> = { date, label };
    point[userId] = posOnDay(myHistory, endOfDay);
    friends.forEach((f) => {
      point[f.id] = posOnDay(f.history, endOfDay);
    });
    return point;
  });

  const chartSeries = [
    { key: userId, label: myDisplayName, isMe: true },
    ...friends.map((f) => ({
      key: f.id,
      label: f.display_name,
      isMe: false,
    })),
  ];

  const alreadyFriendOrPending = new Set([
    ...friends.map((f) => f.id),
    ...pendingRequests.map((r) => r.requested_by),
  ]);

  return (
    <div className="space-y-10">
      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div>
          <SectionTitle eyebrow="Requests" title="Pending" />
          <div className="mt-4 space-y-2">
            {pendingRequests.map((r) => (
              <div
                key={`${r.user_a}-${r.user_b}`}
                className="flex items-center justify-between p-4"
                style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
              >
                <div style={{ fontSize: 19, fontStyle: "italic" }}>
                  {r.profile.display_name}
                </div>
                <button
                  onClick={() =>
                    acceptRequest.mutate({
                      user_a: r.user_a,
                      user_b: r.user_b,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    background: "#5d7a3a",
                    color: "#f4ede0",
                    fontFamily: "DM Mono, monospace",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  <Check size={13} /> Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <SectionTitle eyebrow="Discover" title="Find friends" />
        <div className="mt-4 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by display name…"
            className="w-full border border-rule bg-parchment-light px-4 py-3 text-base outline-none focus:border-ochre"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "#2c1d0f",
            }}
          />
        </div>
        {searchResults.length > 0 && (
          <div
            className="mt-1 border border-rule"
            style={{ background: "#fbf6ea" }}
          >
            {searchResults.map((u) => {
              const isFriendOrPending = alreadyFriendOrPending.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px dotted #d4be96" }}
                >
                  <div style={{ fontSize: 18, fontStyle: "italic" }}>
                    {u.display_name}
                  </div>
                  {!isFriendOrPending && (
                    <button
                      onClick={() => sendRequest.mutate(u.id)}
                      disabled={sendRequest.isPending}
                      className="flex items-center gap-2 px-4 py-1.5"
                      style={{
                        background: "#2c1d0f",
                        color: "#f4ede0",
                        fontFamily: "DM Mono, monospace",
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      <UserPlus size={12} /> Add
                    </button>
                  )}
                  {isFriendOrPending && (
                    <span
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 10,
                        color: "#7a5d3a",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {friends.some((f) => f.id === u.id) ? "Friend" : "Pending"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div>
        <SectionTitle eyebrow="Leaderboard" title="Among friends" />
        {loadingFriends ? (
          <div className="mt-4 space-y-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse"
                style={{ background: "#ebdcb8" }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-1">
            {leaderboard.map((p, i) => {
              const pct = (p.chapter_index / TOTAL_CH) * 100;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-4"
                  style={{
                    background: p.isMe ? "#2c1d0f" : "#fbf6ea",
                    color: p.isMe ? "#f4ede0" : "#2c1d0f",
                    border: "1px solid #d4be96",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      color: p.isMe ? "#a87132" : "#7a5d3a",
                      minWidth: 24,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 22, fontStyle: "italic", flex: 1 }}>
                    {p.display_name}
                    {p.isMe && (
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 10,
                          letterSpacing: "0.2em",
                          color: "#a87132",
                          marginLeft: 10,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-6">
                    <div
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 11,
                        color: p.isMe ? "#c9b890" : "#7a5d3a",
                      }}
                    >
                      ch. {p.chapter_index}
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontStyle: "italic",
                        minWidth: 80,
                        textAlign: "right",
                      }}
                    >
                      {pct.toFixed(1)}%
                    </div>
                  </div>
                  <div
                    style={{
                      flex: "0 0 100px",
                      height: 3,
                      background: p.isMe ? "#5a4023" : "#ebdcb8",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: `${Math.min(pct, 100)}%`,
                        background: p.isMe ? "#a87132" : "#2c1d0f",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Position comparison chart — last 30 days */}
      {friends.length > 0 && (
        <div
          className="p-8"
          style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
        >
          <SectionTitle
            eyebrow="Comparison"
            title="Position progress · last 30 days"
          />
          <div style={{ marginTop: 24 }}>
            <CumulativeLineChart data={chartData} series={chartSeries} />
          </div>
        </div>
      )}
    </div>
  );
}
