import { SectionTitle } from "@/components/section-title";

const mono: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
};

const serif: React.CSSProperties = {
  fontFamily: "Cormorant Garamond, serif",
};

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex gap-6 py-7"
      style={{ borderBottom: "1px dotted #d4be96" }}
    >
      <div
        style={{
          ...mono,
          fontSize: 11,
          letterSpacing: "0.3em",
          color: "#a87132",
          minWidth: 32,
          paddingTop: 4,
        }}
      >
        {number}
      </div>
      <div>
        <div
          style={{
            ...serif,
            fontSize: 22,
            fontStyle: "italic",
            color: "#2c1d0f",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#5a4023",
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-5"
      style={{
        background: "#fbf6ea",
        border: "1px solid #d4be96",
        borderLeft: "3px solid #a87132",
        fontSize: 15,
        color: "#5a4023",
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

export default function HowToUsePage() {
  return (
    <div className="space-y-12">
      <div>
        <SectionTitle eyebrow="Guide" title="How to use Lectio" />
        <p
          style={{
            marginTop: 12,
            fontSize: 17,
            color: "#5a4023",
            maxWidth: 560,
            lineHeight: 1.7,
          }}
        >
          Lectio is a quiet companion for your Bible reading journey. It tracks
          where you are — not what you&rsquo;ve ticked — so every time you open
          it, your progress is exactly where you left it.
        </p>
      </div>

      {/* Getting started */}
      <div>
        <div
          style={{
            ...mono,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#7a5d3a",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Getting started
        </div>

        <Step number="01" title="Set your bookmarks">
          Press{" "}
          <strong style={{ fontWeight: 600 }}>Move Bookmark</strong> in the top
          right corner. You have two independent bookmarks — one for the{" "}
          <span style={{ color: "#a87132", fontWeight: 600 }}>
            Old Testament
          </span>{" "}
          and one for the{" "}
          <span style={{ color: "#5d7a3a", fontWeight: 600 }}>
            New Testament
          </span>
          . You can read both in parallel at your own pace.
        </Step>

        <Step number="02" title="Pick your book, then your chapter">
          Tap any book in the list to expand its chapters inline. Your current
          bookmark is highlighted in ochre — tap any other chapter to move
          there. The stats preview updates live so you can see exactly how far
          that position puts you.
        </Step>

        <Step number="03" title="Watch your three dials">
          The Progress tab shows three horizontal bars: the whole Bible (with
          both needles), the Old Testament alone, and the New Testament alone.
          Move a bookmark and both the relevant dial and the book-by-book list
          update instantly.
        </Step>
      </div>

      <Callout>
        <strong>Tip:</strong> You don&rsquo;t need to move your bookmark every
        day you read — only move it when your position changes. Lectio records
        each move as a reading event, which is what builds your streak and
        activity chart.
      </Callout>

      {/* Features */}
      <div>
        <div
          style={{
            ...mono,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#7a5d3a",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Features
        </div>

        <Step number="04" title="Activity — rhythm and streaks">
          The Activity tab shows a 30-day bar chart of chapters advanced each
          day (OT and NT combined), your current reading streak, and a log of
          recent bookmark moves. A streak counts any day you move at least one
          bookmark.
        </Step>

        <Step number="05" title="Friends — read together">
          Search for other Lectio users by display name and send a friend
          request. Once connected, you appear on a shared leaderboard ranked by
          total chapters covered. The comparison chart shows how each
          person&rsquo;s position has progressed over the last 30 days.
        </Step>
      </div>

      {/* Colour key */}
      <div>
        <SectionTitle eyebrow="Reference" title="Colour key" />
        <div className="mt-6 space-y-3">
          {[
            { color: "#a87132", label: "Old Testament progress" },
            { color: "#5d7a3a", label: "New Testament progress" },
            { color: "#2c1d0f", label: "Selected / active state" },
            { color: "#d4be96", label: "Uncovered chapters" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-4">
              <span
                style={{
                  display: "inline-block",
                  width: 32,
                  height: 4,
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{ ...mono, fontSize: 11, color: "#5a4023" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
