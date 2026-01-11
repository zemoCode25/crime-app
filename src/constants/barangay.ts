/**
 * Barangay color palette - consistent colors for the whole application.
 * Each barangay has a dark and light variant of the same color family.
 */

export interface BarangayColorPalette {
  id: number;
  name: string;
  key: string;
  dark: string;
  light: string;
}

export const BARANGAY_COLORS: BarangayColorPalette[] = [
  {
    id: 1,
    name: "Poblacion",
    key: "poblacion",
    dark: "#B91C1C",   // red-700
    light: "#FCA5A5",  // red-300
  },
  {
    id: 2,
    name: "Tunasan",
    key: "tunasan",
    dark: "#C2410C",   // orange-700
    light: "#FDBA74",  // orange-300
  },
  {
    id: 3,
    name: "Putatan",
    key: "putatan",
    dark: "#B45309",   // amber-700
    light: "#FCD34D",  // amber-300
  },
  {
    id: 4,
    name: "Bayanan",
    key: "bayanan",
    dark: "#4D7C0F",   // lime-700
    light: "#BEF264",  // lime-300
  },
  {
    id: 5,
    name: "Alabang",
    key: "alabang",
    dark: "#047857",   // emerald-700
    light: "#6EE7B7",  // emerald-300
  },
  {
    id: 6,
    name: "Ayala Alabang",
    key: "ayala_alabang",
    dark: "#0E7490",   // cyan-700
    light: "#67E8F9",  // cyan-300
  },
  {
    id: 7,
    name: "Buli",
    key: "buli",
    dark: "#4338CA",   // indigo-700
    light: "#A5B4FC",  // indigo-300
  },
  {
    id: 8,
    name: "Cupang",
    key: "cupang",
    dark: "#7E22CE",   // purple-700
    light: "#D8B4FE",  // purple-300
  },
  {
    id: 9,
    name: "Sucat",
    key: "sucat",
    dark: "#BE185D",   // pink-700
    light: "#F9A8D4",  // pink-300
  },
] as const;

/**
 * Get barangay color palette by ID
 */
export function getBarangayColorById(id: number): BarangayColorPalette | undefined {
  return BARANGAY_COLORS.find((b) => b.id === id);
}

/**
 * Get barangay color palette by key
 */
export function getBarangayColorByKey(key: string): BarangayColorPalette | undefined {
  return BARANGAY_COLORS.find((b) => b.key === key);
}

/**
 * Get a map of barangay ID to dark color for chart fills
 */
export function getBarangayDarkColorMap(): Map<number, string> {
  return new Map(BARANGAY_COLORS.map((b) => [b.id, b.dark]));
}

/**
 * Get a map of barangay ID to light color for chart fills
 */
export function getBarangayLightColorMap(): Map<number, string> {
  return new Map(BARANGAY_COLORS.map((b) => [b.id, b.light]));
}
