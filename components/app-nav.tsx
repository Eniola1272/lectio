"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { ChapterLogger } from "@/components/logger/chapter-logger";
import { useProgress } from "@/lib/queries/use-progress";
import type { ProgressRow } from "@/lib/queries/use-progress";

const tabs = [
  { href: "/", label: "01 — Progress" },
  { href: "/activity", label: "02 — Activity" },
  { href: "/friends", label: "03 — Friends" },
];

interface AppNavProps {
  userId: string;
  initialProgress: ProgressRow | null;
}

export function AppNav({ userId, initialProgress }: AppNavProps) {
  const pathname = usePathname();
  const [loggerOpen, setLoggerOpen] = useState(false);

  // Reads from the same query cache as ProgressView — stays in sync automatically
  const { data: progress } = useProgress(userId, initialProgress);

  return (
    <>
      <header className="mb-12">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <div
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#7a5d3a",
                textTransform: "uppercase",
              }}
            >
              {new Date().toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 500,
                lineHeight: 1,
                marginTop: 8,
                fontStyle: "italic",
                fontFamily: "Cormorant Garamond, serif",
                color: "#2c1d0f",
              }}
            >
              Lectio<span style={{ color: "#a87132" }}>.</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "#5a4023",
                marginTop: 6,
                maxWidth: 480,
              }}
            >
              A quiet record of progress — from Genesis through Revelation.
            </p>
          </div>

          <button
            onClick={() => setLoggerOpen(true)}
            className="flex items-center gap-2 px-6 py-3 transition-all hover:opacity-80"
            style={{
              background: "#2c1d0f",
              color: "#f4ede0",
              fontFamily: "DM Mono, monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              border: "1px solid #2c1d0f",
            }}
          >
            <MapPin size={14} /> Move Bookmark
          </button>
        </div>

        <div className="rule-ochre mt-8" />
      </header>

      <nav
        className="flex gap-8 mb-10"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        {tabs.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                color: active ? "#2c1d0f" : "#a89070",
                borderBottom: active
                  ? "1px solid #2c1d0f"
                  : "1px solid transparent",
                paddingBottom: 6,
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <ChapterLogger
        open={loggerOpen}
        onClose={() => setLoggerOpen(false)}
        userId={userId}
        currentOtBook={progress?.ot_book ?? undefined}
        currentOtChapter={progress?.ot_chapter ?? undefined}
        currentOtIndex={progress?.ot_chapter_index ?? 0}
        currentNtBook={progress?.nt_book ?? undefined}
        currentNtChapter={progress?.nt_chapter ?? undefined}
        currentNtIndex={progress?.nt_chapter_index ?? 0}
      />
    </>
  );
}
