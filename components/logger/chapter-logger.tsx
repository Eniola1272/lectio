"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BIBLE, chapterIndex, TOTAL_OT_CH, type Testament } from "@/lib/bible";
import { useSetProgress } from "@/lib/queries/use-progress";
import { computeStats } from "@/lib/stats";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ChapterLoggerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentOtBook?: string;
  currentOtChapter?: number;
  currentOtIndex?: number;
  currentNtBook?: string;
  currentNtChapter?: number;
  currentNtIndex?: number;
}

export function ChapterLogger({
  open,
  onClose,
  userId,
  currentOtBook,
  currentOtChapter,
  currentOtIndex = 0,
  currentNtBook,
  currentNtChapter,
  currentNtIndex = 0,
}: ChapterLoggerProps) {
  const [testament, setTestament] = useState<Testament>("old");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<{ name: string; chapters: number } | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const setProgress = useSetProgress(userId);

  // Derive current bookmark for whichever testament is active
  const currentBook = testament === "old" ? currentOtBook : currentNtBook;
  const currentChapter = testament === "old" ? currentOtChapter : currentNtChapter;

  // On open or testament switch — auto-expand the current bookmarked book, clear new selection
  useEffect(() => {
    if (open) {
      setSelectedBook(null);
      setSelectedChapter(null);
      setExpandedBook(currentBook ?? null);
    }
  }, [open, testament]); // eslint-disable-line react-hooks/exhaustive-deps

  const books = BIBLE[testament];

  // Testament-relative index for the newly selected position
  const selectedIndex =
    selectedBook && selectedChapter
      ? testament === "old"
        ? chapterIndex(selectedBook.name, selectedChapter)
        : chapterIndex(selectedBook.name, selectedChapter) - TOTAL_OT_CH
      : null;

  // Preview stats for the selected position
  const previewStats =
    selectedIndex !== null && selectedIndex > 0
      ? testament === "old"
        ? computeStats(selectedIndex, currentNtIndex)
        : computeStats(currentOtIndex, selectedIndex)
      : null;

  const handleSave = async () => {
    if (!selectedBook || !selectedChapter || !selectedIndex) return;
    await setProgress.mutateAsync({
      testament,
      book: selectedBook.name,
      chapter: selectedChapter,
      chapter_index: selectedIndex,
    });
    onClose();
    setSelectedBook(null);
    setSelectedChapter(null);
  };

  const switchTestament = (t: Testament) => {
    setTestament(t);
    setSelectedBook(null);
    setSelectedChapter(null);
  };

  const toggleBook = (bookName: string, bookObj: { name: string; chapters: number }) => {
    if (expandedBook === bookName) {
      setExpandedBook(null);
    } else {
      setExpandedBook(bookName);
      // Clear chapter selection when switching to a different book
      if (selectedBook?.name !== bookName) {
        setSelectedBook(bookObj);
        setSelectedChapter(null);
      }
    }
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

          {/* Book accordion list */}
          <div style={{ border: "1px solid #d4be96" }}>
            {books.map((b, i) => {
              const isExpanded = expandedBook === b.name;
              const isCurrentBook = currentBook === b.name;
              const hasNewSelection = selectedBook?.name === b.name && selectedChapter !== null;

              return (
                <div
                  key={b.name}
                  style={{ borderTop: i === 0 ? "none" : "1px solid #d4be96" }}
                >
                  {/* Book header row */}
                  <button
                    onClick={() => toggleBook(b.name, b)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: hasNewSelection
                        ? "#2c1d0f"
                        : isExpanded
                        ? "#f0e8d8"
                        : "#fbf6ea",
                      color: hasNewSelection ? "#f4ede0" : "#2c1d0f",
                      textAlign: "left",
                    }}
                  >
                    {/* Expand chevron */}
                    <span style={{ color: hasNewSelection ? "#a87132" : "#c9b890", flexShrink: 0 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>

                    {/* Book name */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: 17,
                        fontStyle: "italic",
                        fontFamily: "Cormorant Garamond, serif",
                      }}
                    >
                      {b.name}
                    </span>

                    {/* Current bookmark indicator */}
                    {isCurrentBook && (
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          color: hasNewSelection ? "#c9b890" : "#a87132",
                          textTransform: "uppercase",
                        }}
                      >
                        {currentChapter !== undefined ? `ch. ${currentChapter}` : "bookmark"}
                      </span>
                    )}

                    {/* New selection indicator */}
                    {hasNewSelection && (
                      <span
                        style={{
                          fontFamily: "DM Mono, monospace",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          color: "#a87132",
                          textTransform: "uppercase",
                        }}
                      >
                        → ch. {selectedChapter}
                      </span>
                    )}
                  </button>

                  {/* Chapter grid — slides in/out */}
                  <div
                    style={{
                      overflow: "hidden",
                      maxHeight: isExpanded ? "600px" : "0",
                      transition: "max-height 0.22s ease",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px 12px",
                        background: "#f8f3e8",
                        borderTop: "1px solid #e4d4ac",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
                          gap: 4,
                        }}
                      >
                        {Array.from({ length: b.chapters }, (_, i) => i + 1).map((n) => {
                          const absIdx = chapterIndex(b.name, n);
                          const relIdx = testament === "old" ? absIdx : absIdx - TOTAL_OT_CH;
                          const isCurrent = isCurrentBook && relIdx === (testament === "old" ? currentOtIndex : currentNtIndex);
                          const isSelected = selectedBook?.name === b.name && selectedChapter === n;

                          return (
                            <button
                              key={n}
                              onClick={() => {
                                setSelectedBook(b);
                                setSelectedChapter(n);
                              }}
                              title={isCurrent ? "Current bookmark" : undefined}
                              style={{
                                aspectRatio: "1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: isSelected
                                  ? "#2c1d0f"
                                  : isCurrent
                                  ? "#a87132"
                                  : "#fbf6ea",
                                color: isSelected || isCurrent ? "#f4ede0" : "#2c1d0f",
                                border: "1px solid #d4be96",
                                fontFamily: "DM Mono, monospace",
                                fontSize: 11,
                                position: "relative",
                              }}
                            >
                              {n}
                              {isCurrent && !isSelected && (
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
                        })}
                      </div>

                      {/* Inline preview stats when a chapter is selected */}
                      {previewStats && selectedBook?.name === b.name && selectedChapter !== null && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: "10px 12px",
                            background: "#f4ede0",
                            border: "1px solid #d4be96",
                            display: "flex",
                            gap: 24,
                          }}
                        >
                          <Stat
                            value={`${previewStats.totalPct.toFixed(1)}%`}
                            label="of Bible"
                          />
                          {testament === "old" ? (
                            <Stat
                              value={`${previewStats.otPct.toFixed(1)}%`}
                              label="of OT"
                              accent="#a87132"
                            />
                          ) : (
                            <Stat
                              value={`${previewStats.ntPct.toFixed(1)}%`}
                              label="of NT"
                              accent="#5d7a3a"
                            />
                          )}
                          <Stat
                            value={previewStats.chaptersLeftInBible}
                            label="chapters left"
                            accent="#5d7a3a"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              color: "#7a5d3a",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Current bookmark (always visible if set) */}
            {currentBook && currentChapter && (
              <span style={{ color: "#a89070", fontSize: 10 }}>
                now:{" "}
                <em style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 13 }}>
                  {currentBook}
                </em>{" "}
                ch. {currentChapter}
              </span>
            )}
            {/* New selection */}
            {selectedBook && selectedChapter ? (
              <span>
                <em style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 15 }}>
                  {selectedBook.name}
                </em>
                &nbsp;·&nbsp;ch. {selectedChapter}
              </span>
            ) : !currentBook ? (
              <span style={{ color: "#a89070" }}>Select a chapter above</span>
            ) : null}
          </div>
          <button
            onClick={handleSave}
            disabled={!selectedBook || !selectedChapter || setProgress.isPending}
            className="px-6 py-3 transition-all"
            style={{
              background: selectedBook && selectedChapter ? "#2c1d0f" : "#c9b890",
              color: "#f4ede0",
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: selectedBook && selectedChapter ? "pointer" : "not-allowed",
            }}
          >
            {setProgress.isPending ? "Saving..." : "Set Bookmark →"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 22,
          fontStyle: "italic",
          fontFamily: "Cormorant Garamond, serif",
          lineHeight: 1,
          color: accent ?? "#2c1d0f",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 9,
          color: "#7a5d3a",
          marginTop: 3,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
