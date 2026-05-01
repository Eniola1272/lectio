import { Check } from "lucide-react";
import type { BibleBook, Testament } from "@/lib/bible";
import type { Entry } from "@/lib/stats";

interface BookListProps {
  title: string;
  books: BibleBook[];
  entries: Entry[];
  testament: Testament;
}

export function BookList({ title, books, entries, testament }: BookListProps) {
  const counts: Record<string, Set<number>> = {};
  entries
    .filter((e) => e.testament === testament)
    .forEach((e) => {
      if (!counts[e.book]) counts[e.book] = new Set();
      counts[e.book].add(e.chapter);
    });

  return (
    <div>
      <div
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "#a87132",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div>
        {books.map((b) => {
          const read = counts[b.name]?.size ?? 0;
          const pct = (read / b.chapters) * 100;
          const done = read === b.chapters;
          return (
            <div
              key={b.name}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: "1px dotted #d4be96" }}
            >
              <div style={{ flex: "0 0 16px" }}>
                {done ? (
                  <Check size={14} style={{ color: "#5d7a3a" }} />
                ) : (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: read > 0 ? "#a87132" : "#d4be96",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontStyle: read > 0 ? "italic" : "normal",
                  color: read > 0 ? "#2c1d0f" : "#7a5d3a",
                  fontFamily: "Cormorant Garamond, serif",
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 11,
                  color: "#7a5d3a",
                  minWidth: 50,
                  textAlign: "right",
                }}
              >
                {read}/{b.chapters}
              </div>
              <div
                style={{
                  flex: "0 0 60px",
                  height: 2,
                  background: "#ebdcb8",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${pct}%`,
                    background: done ? "#5d7a3a" : "#a87132",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
