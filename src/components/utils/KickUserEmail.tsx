import * as React from "react";

interface KickUserEmailProps {
  fullName: string;
  removedBy: string;
  reason: string;
}

export function KickUserEmail({
  fullName,
  removedBy,
  reason,
}: KickUserEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#111827",
        lineHeight: 1.5,
      }}
    >
      <h2 style={{ color: "#b91c1c" }}>Muntinlupa Crime Mapping System</h2>
      <p>Hi {fullName},</p>
      <p>
        This is to inform you that your administrator access to the Crime
        Mapping System has been revoked by {removedBy}.
      </p>
      <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
        Reason provided:
      </p>
      <blockquote
        style={{
          borderLeft: "4px solid #f87171",
          paddingLeft: "1rem",
          margin: "0 0 1rem",
          color: "#374151",
          fontStyle: "italic",
        }}
      >
        {reason}
      </blockquote>
      <p>
        If you have any questions or believe this was made in error, please
        reach out to the system administrators for clarification.
      </p>
      <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2rem" }}>
        &copy; {new Date().getFullYear()} Crime Monitoring &amp; Response System
      </p>
    </div>
  );
}
