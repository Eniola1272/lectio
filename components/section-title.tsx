interface SectionTitleProps {
  eyebrow: string;
  title: string;
}

export function SectionTitle({ eyebrow, title }: SectionTitleProps) {
  return (
    <div>
      <div
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "#a87132",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 32,
          fontStyle: "italic",
          marginTop: 4,
          fontFamily: "Cormorant Garamond, serif",
          color: "#2c1d0f",
        }}
      >
        {title}
      </div>
    </div>
  );
}
