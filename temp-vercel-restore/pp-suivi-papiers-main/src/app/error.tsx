"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== "undefined") {
    // Aide au debug en dev
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2 style={{ margin: 0, marginBottom: ".5rem" }}>Une erreur est survenue</h2>
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
  );
}

