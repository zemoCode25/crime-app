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
