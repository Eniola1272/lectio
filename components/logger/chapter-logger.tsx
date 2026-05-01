"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BIBLE, chapterIndex, testamentOf, type Testament } from "@/lib/bible";
import { useSetProgress } from "@/lib/queries/use-progress";
import { computeStatsFromPosition } from "@/lib/stats";

interface ChapterLoggerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentIndex?: number; // current bookmark position (1-based)
}

export function ChapterLogger({
  open,
  onClose,
  userId,
  currentIndex = 0,
}: ChapterLoggerProps) {
  const [testament, setTestament] = useState<Testament>("old");
  const [book, setBook] = useState<{ name: string; chapters: number } | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);

  const setProgress = useSetProgress(userId);

  const books = BIBLE[testament];

  const selectedIndex =
    book && chapter ? chapterIndex(book.name, chapter) : null;
  const previewStats = selectedIndex
    ? computeStatsFromPosition(selectedIndex)
    : null;

  const handleSave = async () => {
    if (!book || !chapter || !selectedIndex) return;
    await setProgress.mutateAsync({
      book: book.name,
      chapter,
      chapter_index: selectedIndex,
    });
    onClose();
    setBook(null);
    setChapter(null);
  };

  const switchTestament = (t: Testament) => {
    setTestament(t);
    setBook(null);
    setChapter(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Move your bookmark</DialogDescription>
          <DialogTitle>Where are you now?</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 overflow-y-auto flex-1">
          {/* Testament toggle */}
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "#7a5d3a",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Testament
          </div>
          <div className="flex gap-2 mb-5">
            {(["old", "new"] as Testament[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTestament(t)}
                className="px-5 py-2 transition-all"
                style={{
                  background: testament === t ? "#2c1d0f" : "transparent",
                  color: testament === t ? "#f4ede0" : "#2c1d0f",
                  border: "1px solid #2c1d0f",
                  fontFamily: "DM Mono, monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {t === "old" ? "Old Testament" : "New Testament"}
              </button>
            ))}
          </div>

          {/* Book grid */}
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "#7a5d3a",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Book
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
            {books.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  setBook(b);
                  setChapter(null);
                }}
                className="p-3 text-left transition-all"
                style={{
                  background: book?.name === b.name ? "#a87132" : "#fbf6ea",
                  color: book?.name === b.name ? "#f4ede0" : "#2c1d0f",
                  border: "1px solid #d4be96",
                  fontSize: 14,
                  fontStyle: "italic",
                  fontFamily: "Cormorant Garamond, serif",
                }}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Chapter grid */}
          {book && (
            <>
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  color: "#7a5d3a",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Chapter in{" "}
                <em style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {book.name}
                </em>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 mb-5">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(
                  (n) => {
                    const idx = chapterIndex(book.name, n);
                    const isCurrent = idx === currentIndex;
                    const selected = chapter === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setChapter(n)}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: selected
                            ? "#2c1d0f"
                            : isCurrent
                            ? "#a87132"
                            : "#fbf6ea",
                          color: selected || isCurrent ? "#f4ede0" : "#2c1d0f",
                          border: "1px solid #d4be96",
                          fontFamily: "DM Mono, monospace",
                          fontSize: 11,
                          position: "relative",
                        }}
                        title={isCurrent ? "Current bookmark" : undefined}
                      >
                        {n}
                        {isCurrent && !selected && (
                          <span
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 3,
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "#f4ede0",
                            }}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </>
          )}

          {/* Live preview stats */}
          {previewStats && (
            <div
              className="mb-4 p-4"
              style={{ background: "#f4ede0", border: "1px solid #d4be96" }}
            >
              <div
                style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  color: "#7a5d3a",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                At this position
              </div>
              <div className="flex gap-8">
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontStyle: "italic",
                      fontFamily: "Cormorant Garamond, serif",
                    }}
                  >
                    {previewStats.totalPct.toFixed(1)}
                    <span style={{ fontSize: 14, color: "#a87132" }}>%</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 10,
                      color: "#7a5d3a",
                    }}
                  >
                    of Bible
                  </div>
                </div>
                {testamentOf(book?.name ?? "") === "new" ? (
                  <div>
                    <div
                      style={{
                        fontSize: 28,
                        fontStyle: "italic",
                        fontFamily: "Cormorant Garamond, serif",
                      }}
                    >
                      {previewStats.ntPct.toFixed(1)}
                      <span style={{ fontSize: 14, color: "#a87132" }}>%</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 10,
                        color: "#7a5d3a",
                      }}
                    >
                      of New Testament
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 28,
                        fontStyle: "italic",
                        fontFamily: "Cormorant Garamond, serif",
                      }}
                    >
                      {previewStats.otPct.toFixed(1)}
                      <span style={{ fontSize: 14, color: "#a87132" }}>%</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "DM Mono, monospace",
                        fontSize: 10,
                        color: "#7a5d3a",
                      }}
                    >
                      of Old Testament
                    </div>
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontStyle: "italic",
                      fontFamily: "Cormorant Garamond, serif",
                      color: "#5d7a3a",
                    }}
                  >
                    {previewStats.chaptersLeftInBible}
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Mono, monospace",
                      fontSize: 10,
                      color: "#7a5d3a",
                    }}
                  >
                    chapters left
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              color: "#7a5d3a",
            }}
          >
            {book && chapter ? (
              <span>
                <em style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {book.name}
                </em>
                &nbsp;·&nbsp; ch. {chapter}
              </span>
            ) : (
              "Pick where you are"
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!book || !chapter || setProgress.isPending}
            className="px-6 py-3 transition-all"
            style={{
              background: book && chapter ? "#2c1d0f" : "#c9b890",
              color: "#f4ede0",
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: book && chapter ? "pointer" : "not-allowed",
            }}
          >
            {setProgress.isPending ? "Saving..." : "Set Bookmark →"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
