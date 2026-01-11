/**
 * Status definitions with color palette.
 * Each status has a dark and light variant of the same color family.
 */
export const STATUSES = [
  { value: "open", label: "Open", dark: "#B91C1C", light: "#FCA5A5" },                            // red
  { value: "under investigation", label: "Under Investigation", dark: "#C2410C", light: "#FDBA74" }, // orange
  { value: "case settled", label: "Case Settled", dark: "#15803D", light: "#86EFAC" },           // green
  { value: "lupon", label: "Lupon", dark: "#0F766E", light: "#5EEAD4" },                          // teal
  { value: "direct filing", label: "Direct Filing", dark: "#4338CA", light: "#A5B4FC" },         // indigo
  { value: "for record", label: "For Record", dark: "#B45309", light: "#FCD34D" },               // amber
  { value: "turn-over", label: "Turn-Over", dark: "#0E7490", light: "#67E8F9" },                  // cyan
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

/**
 * Get status by value
 */
export function getStatusByValue(value: string) {
  return STATUSES.find((s) => s.value === value);
}

/**
 * Get a map of status value to dark color for chart fills
 */
export function getStatusDarkColorMap(): Map<string, string> {
  return new Map(STATUSES.map((s) => [s.value, s.dark]));
}

/**
 * Get a map of status value to light color for chart fills
 */
export function getStatusLightColorMap(): Map<string, string> {
  return new Map(STATUSES.map((s) => [s.value, s.light]));
}

export const BARANGAY_OPTIONS = [
  {id: 1, value:"Poblacion"},
  {id: 2, value:"Tunasan"},
  {id: 3, value:"Putatan"},
  {id: 4, value:"Bayanan"},
  {id: 5, value:"Alabang"},
  {id: 6, value:"Ayala Alabang"},
  {id: 7, value:"Buli"},
  {id: 8, value:"Cupang"},
  {id: 9, value:"Sucat"}
] as const;

export const BARANGAY_OPTIONS_WITH_ALL = [
  {id: 0, value:"All barangays"},
  {id: 1, value:"Poblacion"},
  {id: 2, value:"Tunasan"},
  {id: 3, value:"Putatan"},
  {id: 4, value:"Bayanan"},
  {id: 5, value:"Alabang"},
  {id: 6, value:"Ayala Alabang"},
  {id: 7, value:"Buli"},
  {id: 8, value:"Cupang"},
  {id: 9, value:"Sucat"}
] as const;

/**
 * Color palette for crime types (up to 20 distinct colors).
 * Used for charts displaying crime type distributions.
 */
export const CRIME_TYPE_COLORS = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#F97316", // orange-500
  "#14B8A6", // teal-500
  "#6366F1", // indigo-500
  "#84CC16", // lime-500
  "#A855F7", // purple-500
  "#22C55E", // green-500
  "#EAB308", // yellow-500
  "#0EA5E9", // sky-500
  "#E11D48", // rose-500
  "#7C3AED", // violet-600
  "#059669", // emerald-600
  "#DC2626", // red-600
  "#2563EB", // blue-600
] as const;

/**
 * Get a color for a crime type by index
 */
export function getCrimeTypeColor(index: number): string {
  return CRIME_TYPE_COLORS[index % CRIME_TYPE_COLORS.length];
}

export const dateInterval = [
  {
    label: "Last 7 days",
    value: "last_7_days",
  },
  {
    label: "Last 30 days",
    value: "last_30_days",
  },
  {
    label: "This month",
    value: "this_month",
  },
  {
    label: "Last month",
    value: "last_month",
  },
  {
    label: "Custom",
    value: "custom",
  },
];
