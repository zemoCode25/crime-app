import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ReportData } from "@/server/queries/reports";
import { format } from "date-fns";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSub: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  kpiTitle: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  kpiDesc: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 2,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 24,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    flex: 1,
    padding: "4 8",
    fontSize: 9,
  },
  tableCellHeader: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 8,
  },
  fillRight: {
    textAlign: "right",
  },
  fillLeft: {
    textAlign: "left",
  },
  fillCenter: {
    textAlign: "center",
  },
  statusBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  statusBarFill: {
    height: "100%",
  },
  remarksSection: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#000000",
    marginTop: 8,
    backgroundColor: "#ffffff",
  },
  remarksLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    height: 24,
    marginHorizontal: 12,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface SystemReportPDFProps {
  data: ReportData;
  dateRange: { from: Date; to: Date };
}

export function SystemReportPDF({ data, dateRange }: SystemReportPDFProps) {
  const generatedAt = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Crime Statistics Report</Text>
            <Text style={styles.headerSub}>
              System Generated Document •{" "}
              {data.mostAffectedBarangay !== "N/A" && data.mostAffectedBarangay
                ? data.mostAffectedBarangay
                : "System Wide"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerSub}>
              Period: {format(dateRange.from, "MMM dd, yyyy")} -{" "}
              {format(dateRange.to, "MMM dd, yyyy")}
            </Text>
          </View>
        </View>

        {/* Executive Summary (KPIs) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.grid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Total Incidents</Text>
              <Text style={styles.kpiValue}>{data.totalCrimes}</Text>
              <Text style={styles.kpiDesc}>Reported cases</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Clearance Rate</Text>
              <Text style={styles.kpiValue}>
                {data.totalCrimes > 0
                  ? ((data.solvedCount / data.totalCrimes) * 100).toFixed(1)
                  : 0}
                %
              </Text>
              <Text style={styles.kpiDesc}>{data.solvedCount} solved</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Top Offense</Text>
              <Text style={styles.kpiValue}>{data.topCrimeType}</Text>
              <Text style={styles.kpiDesc}>Highest frequency</Text>
            </View>
          </View>
        </View>

        {/* Crime Distribution Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crime Type Distribution</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Crime Type
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  styles.fillRight,
                ]}
              >
                Count
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  styles.fillRight,
                ]}
              >
                % Share
              </Text>
            </View>
            {/* Rows */}
            {data.crimeDistribution.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 3 }]}>
                  <Text>{item.name}</Text>
                </View>
                <Text style={[styles.tableCell, styles.fillRight]}>
                  {item.count}
                </Text>
                <Text style={[styles.tableCell, styles.fillRight]}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            ))}
            {data.crimeDistribution.length === 0 && (
              <View
                style={[
                  styles.tableRow,
                  { justifyContent: "center", padding: 10 },
                ]}
              >
                <Text style={{ fontStyle: "italic", color: "#9ca3af" }}>
                  No data available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Barangay Distribution (If available) */}
        {data.barangayDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Barangay Distribution</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 3 },
                  ]}
                >
                  Barangay
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    styles.fillRight,
                  ]}
                >
                  Incidents
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    styles.fillRight,
                  ]}
                >
                  % Share
                </Text>
              </View>
              {data.barangayDistribution.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 3 }]}>
                    <Text>{item.name}</Text>
                  </View>
                  <Text style={[styles.tableCell, styles.fillRight]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.tableCell, styles.fillRight]}>
                    {data.totalCrimes > 0
                      ? ((item.count / data.totalCrimes) * 100).toFixed(1)
                      : 0}
                    %
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Case Status Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Status Overview</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Status
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  styles.fillRight,
                ]}
              >
                Volume
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  styles.fillRight,
                ]}
              >
                Status Share
              </Text>
            </View>
            {data.statusDistribution.map((item, idx) => {
              const percentage =
                data.totalCrimes > 0
                  ? (item.count / data.totalCrimes) * 100
                  : 0;
              return (
                <View key={idx} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <Text>{item.status}</Text>
                    {/* Simple embedded bar */}
                    <View style={styles.statusBar}>
                      <View
                        style={[
                          styles.statusBarFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: item.fill || "#000",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.tableCell, styles.fillRight]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.tableCell, styles.fillRight]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              );
            })}
            {data.statusDistribution.length === 0 && (
              <View
                style={[
                  styles.tableRow,
                  { justifyContent: "center", padding: 10 },
                ]}
              >
                <Text style={{ fontStyle: "italic", color: "#9ca3af" }}>
                  No status data available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Remarks Section (Manual Entry) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin / Investigator Remarks</Text>
          <View style={styles.remarksSection}>
            <View style={styles.remarksLine} />
            <View style={styles.remarksLine} />
            <View style={styles.remarksLine} />
            <View style={{ ...styles.remarksLine, borderBottomWidth: 0 }} />
          </View>
          <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 4 }}>
            * Use this space for handwritten notes, observations, or official
            validation specifics.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {format(generatedAt, "MMM dd, yyyy HH:mm")}
          </Text>
          <Text style={styles.footerText}>
            Confidential Document • For Official Use Only
          </Text>
        </View>
      </Page>
    </Document>
  );
}
