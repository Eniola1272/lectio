import { TOTAL_CH, TOTAL_OT_CH, TOTAL_NT_CH } from "@/lib/bible";
import type { Stats } from "@/lib/stats";

export interface LinearDialProps {
  otChapterIndex: number; // 1-929, 0 = not set
  ntChapterIndex: number; // 1-260, 0 = not set
  stats: Stats;
  otBook?: string;
  otChapter?: number;
  ntBook?: string;
  ntChapter?: number;
}

// ── shared sub-components ────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "DM Mono, monospace",
        fontSize: 10,
        letterSpacing: "0.3em",
        color: "#7a5d3a",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function AxisRow({
  left,
  mid,
  right,
}: {
  left: string;
  mid?: string;
  right: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
        fontFamily: "DM Mono, monospace",
        fontSize: 9,
        letterSpacing: "0.15em",
        color: "#a89070",
        textTransform: "uppercase",
      }}
    >
      <span>{left}</span>
      {mid && <span>{mid}</span>}
      <span>{right}</span>
    </div>
  );
}

function StatRow({
  items,
}: {
  items: { value: string | number; sub: string; color?: string }[];
}) {
  return (
    <div style={{ display: "flex", gap: 32, marginTop: 20, flexWrap: "wrap" }}>
      {items.map((item) => (
        <div key={item.sub}>
          <div
            style={{
              fontSize: 36,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1,
              color: item.color ?? "#2c1d0f",
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "#7a5d3a",
              marginTop: 4,
            }}
          >
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

function Needle({
  pct,
  color = "#2c1d0f",
}: {
  pct: number;
  color?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${pct}%`,
        top: 0,
        bottom: 0,
        width: 2,
        background: color,
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 7,
          height: 7,
          background: color,
        }}
      />
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export function LinearDial({
  otChapterIndex,
  ntChapterIndex,
  stats,
  otBook,
  otChapter,
  ntBook,
  ntChapter,
}: LinearDialProps) {
  const OT_PCT = (TOTAL_OT_CH / TOTAL_CH) * 100; // ~78.1

  // Whole-Bible positions (as % of full bar width)
  const otBiblePct = (otChapterIndex / TOTAL_CH) * 100; // OT needle in whole bar
  const ntBiblePct = ((TOTAL_OT_CH + ntChapterIndex) / TOTAL_CH) * 100; // NT needle in whole bar

  // OT sub-bar (0–100% within OT)
  const otPct = (otChapterIndex / TOTAL_OT_CH) * 100;

  // NT sub-bar (0–100% within NT)
  const ntPct = (ntChapterIndex / TOTAL_NT_CH) * 100;

  return (
    <div>
      {/* Bookmark labels */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <BookmarkLabel
          testament="OT"
          book={otBook}
          chapter={otChapter}
          color="#a87132"
        />
        <BookmarkLabel
          testament="NT"
          book={ntBook}
          chapter={ntChapter}
          color="#5d7a3a"
        />
      </div>

      {/* ── 1. Whole Bible ── */}
      <Eyebrow>Whole Bible</Eyebrow>
      <div
        style={{ position: "relative", paddingTop: 10, paddingBottom: 10 }}
      >
        {/* Track: 4 segments */}
        <div style={{ display: "flex", height: 16, border: "1px solid #c9b890" }}>
          {/* OT covered */}
          {otBiblePct > 0 && (
            <div style={{ width: `${otBiblePct}%`, background: "#a87132", flexShrink: 0 }} />
          )}
          {/* OT remaining gap */}
          {OT_PCT - otBiblePct > 0 && (
            <div style={{ width: `${OT_PCT - otBiblePct}%`, background: "#e8d9b8", flexShrink: 0 }} />
          )}
          {/* NT covered */}
          {ntChapterIndex > 0 && (
            <div style={{ width: `${(ntChapterIndex / TOTAL_CH) * 100}%`, background: "#5d7a3a", flexShrink: 0 }} />
          )}
          {/* NT remaining */}
          <div style={{ flex: 1, background: "#e8d9b8" }} />
        </div>

        {/* OT / NT divider */}
        <div
          style={{
            position: "absolute",
            left: `${OT_PCT}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: "#c9b890",
          }}
        />

        {/* OT needle */}
        {otChapterIndex > 0 && <Needle pct={otBiblePct} color="#a87132" />}
        {/* NT needle */}
        {ntChapterIndex > 0 && <Needle pct={ntBiblePct} color="#5d7a3a" />}
      </div>
      <AxisRow left="Genesis" mid="Malachi · Matthew" right="Revelation" />
      <StatRow
        items={[
          { value: `${stats.totalPct.toFixed(1)}%`, sub: "of the Bible" },
          { value: stats.total, sub: `of ${TOTAL_CH} chapters` },
          { value: stats.chaptersLeftInBible, sub: "chapters left", color: "#7a5d3a" },
        ]}
      />

      <div style={{ height: 1, background: "#d4be96", margin: "32px 0" }} />

      {/* ── 2. Old Testament ── */}
      <Eyebrow>
        <span style={{ color: "#a87132" }}>●</span>&nbsp; Old Testament
      </Eyebrow>
      <div style={{ position: "relative", paddingTop: 10, paddingBottom: 10 }}>
        <div style={{ display: "flex", height: 16, border: "1px solid #c9b890" }}>
          {otPct > 0 && (
            <div style={{ width: `${otPct}%`, background: "#a87132", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, background: "#e8d9b8" }} />
        </div>
        {otChapterIndex > 0 && <Needle pct={otPct} color="#a87132" />}
      </div>
      <AxisRow left="Genesis" right="Malachi" />
      <StatRow
        items={[
          { value: `${stats.otPct.toFixed(1)}%`, sub: "of OT", color: "#a87132" },
          { value: `${stats.ot} / ${TOTAL_OT_CH}`, sub: "chapters" },
          { value: stats.otChaptersLeft, sub: "left in OT", color: "#7a5d3a" },
        ]}
      />

      <div style={{ height: 1, background: "#d4be96", margin: "32px 0" }} />

      {/* ── 3. New Testament ── */}
      <Eyebrow>
        <span style={{ color: "#5d7a3a" }}>●</span>&nbsp; New Testament
      </Eyebrow>
      <div style={{ position: "relative", paddingTop: 10, paddingBottom: 10 }}>
        <div style={{ display: "flex", height: 16, border: "1px solid #c9b890" }}>
          {ntPct > 0 && (
            <div style={{ width: `${ntPct}%`, background: "#5d7a3a", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, background: "#e8d9b8" }} />
        </div>
        {ntChapterIndex > 0 && <Needle pct={ntPct} color="#5d7a3a" />}
      </div>
      <AxisRow left="Matthew" right="Revelation" />
      <StatRow
        items={[
          { value: `${stats.ntPct.toFixed(1)}%`, sub: "of NT", color: "#5d7a3a" },
          { value: `${stats.nt} / ${TOTAL_NT_CH}`, sub: "chapters" },
          { value: stats.ntChaptersLeft, sub: "left in NT", color: "#7a5d3a" },
        ]}
      />
    </div>
  );
}

function BookmarkLabel({
  testament,
  book,
  chapter,
  color,
}: {
  testament: string;
  book?: string;
  chapter?: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "#7a5d3a",
          textTransform: "uppercase",
        }}
      >
        {testament}
      </span>
      {book && chapter ? (
        <>
          <span
            style={{
              fontSize: 20,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              color: "#2c1d0f",
            }}
          >
            {book}
          </span>
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              color,
            }}
          >
            ch. {chapter}
          </span>
        </>
      ) : (
        <span
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: 10,
            color: "#a89070",
            letterSpacing: "0.15em",
          }}
        >
          not set
        </span>
      )}
    </div>
  );
}
