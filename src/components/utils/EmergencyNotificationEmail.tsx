import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Preview,
  Img,
  Section,
} from "@react-email/components";

interface EmergencyNotificationEmailProps {
  subject: string;
  body: string;
  imageUrl?: string | null;
}

export function EmergencyNotificationEmail({
  subject,
  body,
  imageUrl,
}: EmergencyNotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Emergency alert: {subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading as="h2" style={styles.heading}>
            Emergency Alert
          </Heading>

          <Text style={styles.subject}>{subject}</Text>

          {imageUrl ? (
            <Section style={styles.imageSection}>
              <Img src={imageUrl} alt="Emergency alert" style={styles.image} />
            </Section>
          ) : null}

          <Text style={styles.message}>{body}</Text>

          <Text style={styles.footer}>
            Crime Monitoring & Response System · Stay alert and stay safe.
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
    color: "#111827",
    maxWidth: "520px",
    margin: "0 auto",
    paddingTop: "20px",
    paddingBottom: "36px",
  },
  heading: {
    color: "#dc2626",
    fontSize: "20px",
    fontWeight: "700" as const,
    margin: "0 0 12px 0",
  },
  subject: {
    fontSize: "18px",
    fontWeight: "600" as const,
    margin: "0 0 16px 0",
  },
  imageSection: {
    marginBottom: "16px",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
    objectFit: "cover" as const,
  },
  message: {
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap" as const,
  },
  footer: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center" as const,
  },
};
