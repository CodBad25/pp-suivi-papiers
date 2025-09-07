"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <html>
      <body>
        <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
          <h2 style={{ margin: 0, marginBottom: ".5rem" }}>Erreur globale</h2>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>{error?.message || "Erreur inconnue"}</p>
          <button
            onClick={() => reset()}
            style={{
              padding: ".5rem .75rem",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}

