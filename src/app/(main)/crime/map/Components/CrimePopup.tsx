interface CrimePopupProps {
  title: string;
  location: string;
  status?: string;
  type?: string | null;
  date?: string | null;
}

export function CrimePopup({ title, status, type }: CrimePopupProps) {
  const getStatusBadgeStyle = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "open" || s === "under investigation")
      return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300";
    if (s === "case settled" || s === "closed")
      return "bg-green-100 text-green-800 ring-1 ring-green-300";
    if (s === "direct filing" || s === "for record")
      return "bg-blue-100 text-blue-800 ring-1 ring-blue-300";
    if (s === "lupon")
      return "bg-purple-100 text-purple-800 ring-1 ring-purple-300";
    if (s === "turn-over")
      return "bg-orange-100 text-orange-800 ring-1 ring-orange-300";
    return "bg-gray-100 text-gray-800 ring-1 ring-gray-300";
  };

  return (
    <div className="animate-in fade-in zoom-in-95 w-64 overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-xl duration-150">
      <div className="space-y-3 p-4">
        {/* Case ID */}
        <h3 className="truncate text-base font-bold text-white drop-shadow-sm">
          {title}
        </h3>

        {/* Badges Container */}
        <div className="flex flex-wrap gap-2">
          {/* Type Badge */}
          {type && (
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orange-900 shadow-sm backdrop-blur-sm">
              {type}
            </span>
          )}

          {/* Status Badge */}
          {status && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getStatusBadgeStyle(status)}`}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
