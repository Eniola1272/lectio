import { TOTAL_CH, TOTAL_OT_CH } from "@/lib/bible";
import type { Stats } from "@/lib/stats";

interface LinearDialProps {
  chapterIndex: number;
  stats: Stats;
  book?: string;
  chapter?: number;
}

export function LinearDial({ chapterIndex, stats, book, chapter }: LinearDialProps) {
  const OT_PCT = (TOTAL_OT_CH / TOTAL_CH) * 100; // ~78.1
  const pos = chapterIndex > 0 ? (chapterIndex / TOTAL_CH) * 100 : 0;
  const coveredOT = Math.min(pos, OT_PCT);
  const coveredNT = Math.max(0, pos - OT_PCT);
  const inOT = chapterIndex <= TOTAL_OT_CH;

  return (
    <div>
      {/* Bookmark label */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        {book && chapter ? (
          <>
            <span
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "#7a5d3a",
                textTransform: "uppercase",
              }}
            >
              Bookmark
            </span>
            <span
              style={{
                fontSize: 24,
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
                fontSize: 12,
                color: "#a87132",
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
              letterSpacing: "0.3em",
              color: "#a89070",
              textTransform: "uppercase",
            }}
          >
            No bookmark set — press &ldquo;Move Bookmark&rdquo; to begin
          </span>
        )}
      </div>

      {/* Rail */}
      <div style={{ position: "relative", paddingTop: 12, paddingBottom: 12 }}>
        {/* Track */}
        <div
          style={{
            display: "flex",
            height: 16,
            border: "1px solid #c9b890",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Covered OT */}
          {coveredOT > 0 && (
            <div
              style={{
                width: `${coveredOT}%`,
                height: "100%",
                background: "#a87132",
                flexShrink: 0,
              }}
            />
          )}
          {/* Covered NT */}
          {coveredNT > 0 && (
            <div
              style={{
                width: `${coveredNT}%`,
                height: "100%",
                background: "#5d7a3a",
                flexShrink: 0,
              }}
            />
          )}
          {/* Remaining */}
          <div style={{ flex: 1, height: "100%", background: "#e8d9b8" }} />
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

        {/* Needle */}
        {chapterIndex > 0 && (
          <div
            style={{
              position: "absolute",
              left: `${pos}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: "#2c1d0f",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            {/* Diamond cap */}
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 7,
                height: 7,
                background: "#2c1d0f",
              }}
            />
          </div>
        )}
      </div>

      {/* Axis labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontFamily: "DM Mono, monospace",
          fontSize: 9,
          letterSpacing: "0.15em",
          color: "#a89070",
          textTransform: "uppercase",
        }}
      >
        <span>Genesis</span>
        <span>Malachi · Matthew</span>
        <span>Revelation</span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 40,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1,
            }}
          >
            {stats.otPct.toFixed(1)}
            <span style={{ fontSize: 14, color: "#a87132" }}>%</span>
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "#7a5d3a",
              marginTop: 4,
            }}
          >
            Old Testament
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 40,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1,
            }}
          >
            {stats.ntPct.toFixed(1)}
            <span style={{ fontSize: 14, color: "#5d7a3a" }}>%</span>
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "#7a5d3a",
              marginTop: 4,
            }}
          >
            New Testament
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 40,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1,
              color: inOT ? "#a87132" : "#5d7a3a",
            }}
          >
            {stats.chaptersLeftInTestament}
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "#7a5d3a",
              marginTop: 4,
            }}
          >
            left in {inOT ? "OT" : "NT"}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 40,
              fontStyle: "italic",
              fontFamily: "Cormorant Garamond, serif",
              lineHeight: 1,
              color: "#2c1d0f",
            }}
          >
            {stats.chaptersLeftInBible}
          </div>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              color: "#7a5d3a",
              marginTop: 4,
            }}
          >
            chapters left total
          </div>
        </div>
      </div>
    </div>
  );
}
