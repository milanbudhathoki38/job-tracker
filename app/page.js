import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F4EC",
        color: "#1B2430",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: "640px", textAlign: "center" }}>
        {/* Stamp badge */}
        <div
          style={{
            display: "inline-block",
            border: "3px solid #B8451A",
            borderRadius: "50%",
            padding: "18px 28px",
            transform: "rotate(-6deg)",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "13px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#B8451A",
              fontWeight: 700,
            }}
          >
            Application Tracker
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Zilla Slab', serif",
            fontWeight: 700,
            fontSize: "56px",
            lineHeight: 1.05,
            margin: "0 0 20px 0",
          }}
        >
          Every application,<br />stamped and tracked.
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#5B5346",
            lineHeight: 1.6,
            margin: "0 0 40px 0",
          }}
        >
          A personal log for the whole internship hunt — who you applied to,
          where things stand, and what happens next.
        </p>

        {/* Pipeline strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "48px",
            flexWrap: "wrap",
          }}
        >
          {["Applied", "OA", "Interview", "Offer"].map((stage, i) => (
            <div key={stage} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1px solid #D8D2C2",
                  borderRadius: "999px",
                  padding: "6px 14px",
                  color: "#6B7A5E",
                }}
              >
                {stage}
              </span>
              {i < 3 && <span style={{ color: "#D8D2C2" }}>→</span>}
            </div>
          ))}
        </div>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "#1B2430",
            color: "#F7F4EC",
            padding: "14px 32px",
            borderRadius: "6px",
            textDecoration: "none",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "14px",
            letterSpacing: "0.05em",
          }}
        >
          Open tracker →
        </Link>
      </div>
    </main>
  );
}