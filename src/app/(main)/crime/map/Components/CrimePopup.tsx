import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { getStatusLabel } from "@/lib/status";

interface CrimePopupProps {
  title: string;
  location: string;
  status?: string;
  type?: string | null;
  date?: string | null;
  id?: number | null;
}

// Status constants to avoid magic strings
const STATUS = {
  OPEN: "open",
  UNDER_INVESTIGATION: "under investigation",
  CASE_SETTLED: "case settled",
  CLOSED: "closed",
  DIRECT_FILING: "direct filing",
  FOR_RECORD: "for record",
  LUPON: "lupon",
  TURN_OVER: "turn-over",
} as const;

// Badge style constants
const BADGE_STYLES = {
  YELLOW: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300",
  GREEN: "bg-green-100 text-green-800 ring-1 ring-green-300",
  BLUE: "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
  PURPLE: "bg-purple-100 text-purple-800 ring-1 ring-purple-300",
  ORANGE: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
  GRAY: "bg-gray-100 text-gray-800 ring-1 ring-gray-300",
} as const;

const CONTAINER_CLASSES =
  "animate-in fade-in rounded-sm zoom-in-95 w-full overflow-hidden border border-orange-300 bg-orange-100 shadow-xl duration-150";

const TITLE_LINK_CLASSES =
  "flex items-center truncate text-base font-bold text-orange-800 underline drop-shadow-sm";

const TYPE_BADGE_CLASSES =
  "inline-flex items-center rounded-sm bg-white/95 px-3 py-1 text-xs font-semibold text-orange-900 shadow-sm backdrop-blur-sm";

const STATUS_BADGE_BASE_CLASSES =
  "inline-flex items-center rounded-sm px-3 py-1 text-xs font-semibold shadow-sm";

const ICON_CLASSES = "mr-1 inline h-5 w-5";

/**
 * Pure function to determine badge styling based on case status
 * @param status - The case status string
 * @returns Tailwind CSS classes for the status badge
 */
function getStatusBadgeStyle(status?: string): string {
  if (!status) {
    return BADGE_STYLES.GRAY;
  }

  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === STATUS.OPEN ||
    normalizedStatus === STATUS.UNDER_INVESTIGATION
  ) {
    return BADGE_STYLES.YELLOW;
  }

  if (
    normalizedStatus === STATUS.CASE_SETTLED ||
    normalizedStatus === STATUS.CLOSED
  ) {
    return BADGE_STYLES.GREEN;
  }

  if (
    normalizedStatus === STATUS.DIRECT_FILING ||
    normalizedStatus === STATUS.FOR_RECORD
  ) {
    return BADGE_STYLES.BLUE;
  }

  if (normalizedStatus === STATUS.LUPON) {
    return BADGE_STYLES.PURPLE;
  }

  if (normalizedStatus === STATUS.TURN_OVER) {
    return BADGE_STYLES.ORANGE;
  }

  return BADGE_STYLES.GRAY;
}

export function CrimePopup({ title, status, type, id }: CrimePopupProps) {
  const statusBadgeStyle = getStatusBadgeStyle(status);

  return (
    <div className={CONTAINER_CLASSES}>
      <div className="space-y-3 p-4">
        <Link href={`/crime/cases/${id}`} className={TITLE_LINK_CLASSES}>
          <ShieldAlertIcon className={ICON_CLASSES} />
          {title}
        </Link>

        <div className="flex flex-wrap gap-2">
          {type && <span className={TYPE_BADGE_CLASSES}>{type}</span>}

          {status && (
            <span
              className={`${STATUS_BADGE_BASE_CLASSES} ${statusBadgeStyle}`}
            >
              {getStatusLabel(status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
