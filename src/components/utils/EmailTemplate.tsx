import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Link,
  Preview,
} from "@react-email/components";

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
  inviteLink,
}: EmailTemplateProps) {
  const isBarangayAdmin = role === "barangay_admin";
  const fullName = `${firstName} ${lastName}`;
  const roleText = isBarangayAdmin
    ? "Barangay Administrator"
    : "System Administrator";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        You have been invited to join as {roleText} - Muntinlupa Crime Mapping
        System
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading as="h2" style={styles.heading}>
            Muntinlupa Crime Mapping System
          </Heading>

          <Text style={styles.mainText}>
            <strong>{fullName}</strong>, you have been invited to join as{" "}
            {roleText}.
          </Text>

          <Section style={styles.contentSection}>
            <Text style={styles.text}>
              Hey <strong>{firstName}</strong>!
            </Text>

            {isBarangayAdmin ? (
              <Text style={styles.text}>
                You have been invited to join as a Barangay Administrator for{" "}
                <strong>{barangay}</strong>. As a Barangay Admin, you will have
                access to manage local reports, monitor incidents, and assist in
                coordinating safety responses within your assigned barangay.
              </Text>
            ) : (
              <Text style={styles.text}>
                You have been invited to join as a System Administrator. As a
                System Admin, you will be responsible for managing user
                accounts, maintaining system integrity, and overseeing all
                reports within the system.
              </Text>
            )}

            <Section style={styles.buttonContainer}>
              <Button href={inviteLink} style={styles.button}>
                Accept Invitation
              </Button>
            </Section>
          </Section>

          <Text style={styles.centerText}>
            <Link href={inviteLink} style={styles.link}>
              View invitation link
            </Link>
          </Text>

          <Text style={styles.disclaimer}>
            If you did not expect this invitation, please disregard this email.
          </Text>

          <Text style={styles.footer}>
            Crime Monitoring & Response System · Powered by PLMUN IT Department
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
  },
  container: {
    fontFamily: "Arial, sans-serif",
    color: "#24292e",
    maxWidth: "480px",
    margin: "0 auto",
    paddingTop: "20px",
    paddingBottom: "48px",
  },
  heading: {
    color: "#1d4ed8",
    fontSize: "20px",
    fontWeight: "600" as const,
    margin: "0 0 16px 0",
  },
  mainText: {
    fontSize: "24px",
    lineHeight: "1.25",
    margin: "0 0 24px 0",
  },
  contentSection: {
    padding: "24px",
    border: "1px solid #dedede",
    borderRadius: "5px",
    marginBottom: "16px",
  },
  text: {
    margin: "10px 0",
    textAlign: "left" as const,
  },
  buttonContainer: {
    textAlign: "center" as const,
    marginTop: "16px",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "normal",
    borderRadius: "8px",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  centerText: {
    textAlign: "center" as const,
    margin: "16px 0",
  },
  link: {
    color: "#2563eb",
    fontSize: "12px",
    textDecoration: "none",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#6a737d",
    lineHeight: "24px",
    textAlign: "center" as const,
    marginTop: "60px",
    marginBottom: "16px",
  },
  footer: {
    fontSize: "12px",
    color: "#6a737d",
    lineHeight: "24px",
    textAlign: "center" as const,
    margin: "0",
  },
};
