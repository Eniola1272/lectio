import { SectionTitle } from "@/components/section-title";

const mono: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
};

const serif: React.CSSProperties = {
  fontFamily: "Cormorant Garamond, serif",
};

function Pillar({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-6"
      style={{ background: "#fbf6ea", border: "1px solid #d4be96" }}
    >
      <div
        style={{
          ...mono,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "#a87132",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: 16, color: "#5a4023", lineHeight: 1.75 }}>
        {children}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-2xl">
      {/* Header */}
      <div>
        <SectionTitle eyebrow="About" title="Pastor Eniola Aderounmu" />
        <p
          style={{
            marginTop: 12,
            fontSize: 19,
            ...serif,
            fontStyle: "italic",
            color: "#5a4023",
            lineHeight: 1.6,
          }}
        >
          A dynamic leader whose work spans ministry, medicine, technology, and
          youth empowerment.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#d4be96" }} />

      {/* Four pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Pillar label="Ministry">
          As a pastor at the{" "}
          <strong style={{ fontWeight: 600 }}>
            Disciples Christian Network
          </strong>
          , Pastor Eniola is dedicated to guiding individuals on their spiritual
          journeys and fostering a faith-driven community rooted in purpose and
          belonging.
        </Pillar>

        <Pillar label="Technology">
          A skilled web developer specialising in ReactJS and NextJS, Pastor
          Eniola serves as CEO of{" "}
          <strong style={{ fontWeight: 600 }}>Align Digital Tech</strong>,
          leading initiatives that merge technology with entrepreneurship and
          create innovative solutions in the digital world.
        </Pillar>

        <Pillar label="Youth empowerment">
          Founder of the{" "}
          <strong style={{ fontWeight: 600 }}>Align Mindset Initiative</strong>{" "}
          — a reading community designed to inspire and equip young individuals
          with the knowledge and mindset needed for success, emphasising mental
          transformation, personal growth, and strategic goal-setting.
        </Pillar>

        <Pillar label="Leadership">
          With a holistic approach, Pastor Eniola integrates faith, education,
          technology, and mentorship — making a lasting impact on both
          individuals and communities across every sphere he enters.
        </Pillar>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#d4be96" }} />

      {/* About Lectio */}
      <div>
        <div
          style={{
            ...mono,
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#7a5d3a",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          About this app
        </div>
        <p
          style={{
            fontSize: 16,
            color: "#5a4023",
            lineHeight: 1.8,
          }}
        >
          Lectio was built as a quiet, intentional tool for the reading
          community — a simple way to mark your place in the greatest book ever
          written and to journey through it alongside others. It is part of a
          broader vision to pair faith with innovation, bringing the timeless
          into the digital age.
        </p>
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#5a4023",
            lineHeight: 1.8,
          }}
        >
          The name <em style={serif}>Lectio</em> comes from{" "}
          <em style={serif}>Lectio Divina</em> — the ancient Christian practice
          of slow, meditative reading of Scripture. This app carries that same
          spirit: unhurried, deliberate, and deeply personal.
        </p>
      </div>

      {/* Footer quote */}
      <div
        style={{
          borderLeft: "3px solid #a87132",
          paddingLeft: 20,
        }}
      >
        <p
          style={{
            ...serif,
            fontSize: 22,
            fontStyle: "italic",
            color: "#2c1d0f",
            lineHeight: 1.5,
          }}
        >
          &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
        </p>
        <p
          style={{
            ...mono,
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "#a87132",
            marginTop: 10,
            textTransform: "uppercase",
          }}
        >
          Psalm 119:105
        </p>
      </div>
    </div>
  );
}
