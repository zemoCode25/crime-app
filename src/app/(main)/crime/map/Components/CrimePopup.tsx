import { format } from "date-fns";
import { MapPin, Calendar, AlertCircle, FileText } from "lucide-react";

interface CrimePopupProps {
  title: string;
  location: string;
  status?: string;
  type?: string | number;
  date?: string | null;
}

export function CrimePopup({
  title,
  location,
  status,
  type,
  date,
}: CrimePopupProps) {
  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "open" || s === "under investigation")
      return "bg-amber-500 text-white";
    if (s === "case settled" || s === "closed")
      return "bg-emerald-500 text-white";
    if (s === "direct filing" || s === "for record")
      return "bg-blue-500 text-white";
    if (s === "lupon") return "bg-purple-500 text-white";
    if (s === "turn-over") return "bg-orange-500 text-white";
    return "bg-slate-500 text-white";
  };

  return (
    <div className="w-72 overflow-hidden rounded-lg bg-white font-sans shadow-xl ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-start justify-between bg-slate-900 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {type && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <AlertCircle size={12} className="shrink-0" />
              <span>{type}</span>
            </div>
          )}
        </div>
        {status && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStatusColor(
              status,
            )}`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm leading-snug text-slate-600">{location}</p>
        </div>

        {date && (
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">
              {format(new Date(date), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
        )}
      </div>

      {/* Footer / Action hint */}
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
        <p className="flex items-center justify-end gap-1 text-xs font-medium text-blue-600">
          <FileText size={12} />
          View Details
        </p>
      </div>
    </div>
  );
}
