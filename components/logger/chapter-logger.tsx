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
import { BIBLE, type Testament, type BibleBook } from "@/lib/bible";
import { useEntries, useLogChapter } from "@/lib/queries/use-entries";

interface ChapterLoggerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function ChapterLogger({ open, onClose, userId }: ChapterLoggerProps) {
  const [testament, setTestament] = useState<Testament>("old");
  const [book, setBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);

  const { data: entries = [] } = useEntries(userId);
  const logChapter = useLogChapter(userId);

  const books = BIBLE[testament];
  const readSet = new Set(
    entries
      .filter((e) => e.testament === testament)
      .map((e) => `${e.book}|${e.chapter}`)
  );

  const handleSave = async () => {
    if (!book || !chapter) return;
    await logChapter.mutateAsync({ testament, book: book.name, chapter });
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
          <DialogDescription>Log a chapter</DialogDescription>
          <DialogTitle>Where are you?</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-6 overflow-y-auto flex-1">
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
          <div className="flex gap-2 mb-6">
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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
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
                Chapter in <em style={{ fontFamily: "Cormorant Garamond, serif" }}>{book.name}</em>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 mb-6">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => {
                  const wasRead = readSet.has(`${book.name}|${n}`);
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
                          : wasRead
                          ? "#d8c8a4"
                          : "#fbf6ea",
                        color: selected ? "#f4ede0" : "#2c1d0f",
                        border: "1px solid #d4be96",
                        fontFamily: "DM Mono, monospace",
                        fontSize: 11,
                        position: "relative",
                      }}
                    >
                      {n}
                      {wasRead && !selected && (
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 3,
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#5d7a3a",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
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
                <em style={{ fontFamily: "Cormorant Garamond, serif" }}>{book.name}</em>
                &nbsp;·&nbsp; chapter {chapter}
              </span>
            ) : (
              "Pick a book and chapter"
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!book || !chapter || logChapter.isPending}
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
            {logChapter.isPending ? "Saving..." : "Save Chapter →"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
