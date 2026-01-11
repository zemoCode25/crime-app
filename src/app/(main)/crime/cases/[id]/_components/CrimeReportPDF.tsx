import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { CasePersonRecord } from "@/types/crime-case";
import type { CrimeCaseByIdResult } from "@/server/queries/crime";

// Register fonts (optional - using default Helvetica)
// Font.register({
//   family: "Roboto",
//   src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf",
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #e5e7eb",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  badge: {
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  badgeOpen: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgeSettled: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
  badgeDefault: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  metadataRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  metadataItem: {
    fontSize: 9,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 4,
  },
  text: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },
  grid: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  gridItem: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  personCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    border: "1 solid #d1d5db",
  },
  personCardSuspect: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  personCardComplainant: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  personCardWitness: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  personName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  personRole: {
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 8,
    color: "#6b7280",
  },
  personDetail: {
    fontSize: 9,
    marginBottom: 3,
    color: "#4b5563",
  },
  roleSpecific: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1 solid #e5e7eb",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 8,
  },
});

interface CrimeReportPDFProps {
  crimeCase: NonNullable<CrimeCaseByIdResult["data"]>;
  crimeTypeLabel: string | null;
  getStatusLabel: (status: string | null | undefined) => string;
  getBarangayLabel: (barangayId: number | null | undefined) => string;
  formatDateTime: (value: string | null | undefined) => string;
}

export function CrimeReportPDF({
  crimeCase,
  crimeTypeLabel,
  getStatusLabel,
  getBarangayLabel,
  formatDateTime,
}: CrimeReportPDFProps) {
  const participants = (crimeCase.case_person ??
    []) as unknown as CasePersonRecord[];
  const location = crimeCase.location;

  const getStatusStyle = (status: string | null | undefined) => {
    if (status === "open") return styles.badgeOpen;
    if (status === "case settled") return styles.badgeSettled;
    return styles.badgeDefault;
  };

  const getPersonCardStyle = (role: string | null | undefined) => {
    if (role === "suspect") return styles.personCardSuspect;
    if (role === "complainant") return styles.personCardComplainant;
    if (role === "witness") return styles.personCardWitness;
    return {};
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            CASE REPORT • {crimeCase.case_number || `ID: ${crimeCase.id}`}
          </Text>
          <Text style={styles.title}>{crimeTypeLabel}</Text>
          <View style={[styles.badge, getStatusStyle(crimeCase.case_status)]}>
            <Text>{getStatusLabel(crimeCase.case_status)}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataItem}>
              Reported: {formatDateTime(crimeCase.report_datetime)}
            </Text>
            <Text style={styles.metadataItem}>
              Incident: {formatDateTime(crimeCase.incident_datetime)}
            </Text>
            <Text style={styles.metadataItem}>
              Visibility: {crimeCase.visibility}
            </Text>
          </View>
        </View>

        {/* Incident Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Description</Text>
          <Text style={styles.text}>
            {crimeCase.description || "No description provided."}
          </Text>
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Address / Landmark</Text>
              <Text style={styles.value}>
                {location?.crime_location ||
                  location?.landmark ||
                  "Not specified"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Barangay</Text>
              <Text style={styles.value}>
                {getBarangayLabel(location?.barangay)}
              </Text>
            </View>
          </View>
          <View style={[styles.grid, { marginTop: 12 }]}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Coordinates</Text>
              <Text style={styles.value}>
                {location?.lat && location?.long
                  ? `${location.lat}, ${location.long}`
                  : "No coordinates"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Map Pin</Text>
              <Text style={styles.value}>{location?.pin || "No pin"}</Text>
            </View>
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Investigator</Text>
              <Text style={styles.value}>
                {crimeCase.investigator || "Not assigned"}
              </Text>
              {crimeCase.investigator_notes && (
                <Text
                  style={[styles.text, { marginTop: 4, fontStyle: "italic" }]}
                >
                  "{crimeCase.investigator_notes}"
                </Text>
              )}
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Responder</Text>
              <Text style={styles.value}>
                {crimeCase.responder || "Not recorded"}
              </Text>
            </View>
          </View>
          {(crimeCase.remarks || crimeCase.follow_up) && (
            <View style={[styles.grid, { marginTop: 12 }]}>
              {crimeCase.remarks && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Remarks</Text>
                  <Text style={styles.text}>{crimeCase.remarks}</Text>
                </View>
              )}
              {crimeCase.follow_up && (
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Follow-up</Text>
                  <Text style={styles.text}>{crimeCase.follow_up}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* People Involved */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            People Involved ({participants.length})
          </Text>
          {participants.length === 0 ? (
            <Text style={styles.text}>No people recorded</Text>
          ) : (
            participants.map((person) => {
              const profile = person.person_profile;
              const fullName =
                profile?.first_name || profile?.last_name
                  ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                  : "Unnamed person";
              const role = person.case_role || "unknown";

              return (
                <View
                  key={person.id}
                  style={[styles.personCard, getPersonCardStyle(role)]}
                >
                  <Text style={styles.personName}>{fullName}</Text>
                  <Text style={styles.personRole}>{role}</Text>

                  {profile?.contact_number && (
                    <Text style={styles.personDetail}>
                      Phone: {profile.contact_number}
                    </Text>
                  )}
                  {profile?.address && (
                    <Text style={styles.personDetail}>
                      Address: {profile.address}
                    </Text>
                  )}
                  {profile?.birth_date && (
                    <Text style={styles.personDetail}>
                      Birth Date:{" "}
                      {new Date(profile.birth_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </Text>
                  )}
                  {profile?.sex && (
                    <Text style={styles.personDetail}>
                      Sex:{" "}
                      {profile.sex.charAt(0).toUpperCase() +
                        profile.sex.slice(1)}
                    </Text>
                  )}
                  {profile?.civil_status && (
                    <Text style={styles.personDetail}>
                      Civil Status:{" "}
                      {profile.civil_status.charAt(0).toUpperCase() +
                        profile.civil_status.slice(1)}
                    </Text>
                  )}
                  {profile?.person_notified && (
                    <Text style={styles.personDetail}>
                      Person Notified: {profile.person_notified}
                    </Text>
                  )}
                  {profile?.related_contact && (
                    <Text style={styles.personDetail}>
                      Related Contact: {profile.related_contact}
                    </Text>
                  )}

                  {/* Role-specific details */}
                  {(person.suspect?.motive ||
                    person.suspect?.weapon_used ||
                    person.complainant?.narrative ||
                    person.witness?.testimony) && (
                    <View style={styles.roleSpecific}>
                      {person.suspect?.motive && (
                        <Text style={styles.personDetail}>
                          Motive: {person.suspect.motive}
                        </Text>
                      )}
                      {person.suspect?.weapon_used && (
                        <Text style={styles.personDetail}>
                          Weapon: {person.suspect.weapon_used}
                        </Text>
                      )}
                      {person.complainant?.narrative && (
                        <Text
                          style={[styles.personDetail, { fontStyle: "italic" }]}
                        >
                          "{person.complainant.narrative}"
                        </Text>
                      )}
                      {person.witness?.testimony && (
                        <Text
                          style={[styles.personDetail, { fontStyle: "italic" }]}
                        >
                          "{person.witness.testimony}"
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleString()} • Crime Report System
        </Text>
      </Page>
    </Document>
  );
}
