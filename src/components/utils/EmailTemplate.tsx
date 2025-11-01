import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  role: "system_admin" | "barangay_admin";
  barangay?: string;
  inviteLink: string;
}

export function EmailTemplate({
  firstName,
  lastName,
  role,
  barangay,
}: EmailTemplateProps) {
  const isBarangayAdmin = role === "barangay_admin";
  const fullName = `${firstName} ${lastName}`;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#111827",
        lineHeight: "1.6",
      }}
    >
      <h2 style={{ color: "#1d4ed8" }}>Muntinlupa Crime Mapping System</h2>

      <p>Hi {fullName},</p>

      {isBarangayAdmin ? (
        <p>
          You’ve been invited to join as a <strong>Barangay Admin</strong> for{" "}
          <strong>{barangay}</strong>. As a Barangay Admin, you’ll have access
          to manage local reports, monitor incidents, and assist in coordinating
          safety responses within your assigned barangay.
        </p>
      ) : (
        <p>
          You’ve been invited to join as a <strong>System Administrator</strong>
          . As a System Admin, you’ll be responsible for managing user accounts,
          maintaining system integrity, and overseeing all reports within the
          system.
        </p>
      )}

      <p>
        To get started, click the button below to set up your admin account and
        activate your access:
      </p>

      <p>
        <a
          href="#"
          style={{
            display: "inline-block",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Accept Invitation
        </a>
      </p>

      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        If you did not expect this invitation, you can safely ignore this email.
      </p>

      <hr
        style={{
          margin: "2rem 0",
          border: "none",
          borderTop: "1px solid #e5e7eb",
        }}
      />

      <p style={{ fontSize: "12px", color: "#9ca3af" }}>
        © {new Date().getFullYear()} Crime Monitoring & Response System
        <br />
        Powered by the PLMUN IT Department
      </p>
    </div>
  );
}
