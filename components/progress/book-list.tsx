import { Check } from "lucide-react";
import { chapterIndex } from "@/lib/bible";

interface Book {
  name: string;
  chapters: number;
}

interface BookListProps {
  title: string;
  books: Book[];
  currentChapterIndex: number;
}

export function BookList({ title, books, currentChapterIndex }: BookListProps) {
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
          const firstIdx = chapterIndex(b.name, 1);
          const lastIdx = chapterIndex(b.name, b.chapters);

          let covered = 0;
          if (currentChapterIndex >= lastIdx) {
            covered = b.chapters;
          } else if (currentChapterIndex >= firstIdx) {
            covered = currentChapterIndex - firstIdx + 1;
          }

          const pct = (covered / b.chapters) * 100;
          const done = covered === b.chapters;
          const started = covered > 0;

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
                      background: started ? "#a87132" : "#d4be96",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontStyle: started ? "italic" : "normal",
                  color: started ? "#2c1d0f" : "#7a5d3a",
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
                {covered}/{b.chapters}
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
