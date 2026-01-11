import { Building2, Clock, MapPin, Phone } from 'lucide-react';
import type { FacilityType } from '@/types/facilities';

interface FacilityPopupProps {
  name: string;
  type: FacilityType;
  address?: string;
  openingHours?: string;
  phone?: string;
}

const TYPE_COLORS: Record<FacilityType, string> = {
  hospital: 'bg-red-100 text-red-800 border-red-300',
  police: 'bg-blue-100 text-blue-800 border-blue-300',
  fire_station: 'bg-orange-100 text-orange-800 border-orange-300',
  clinic: 'bg-green-100 text-green-800 border-green-300',
  government: 'bg-purple-100 text-purple-800 border-purple-300',
};

const TYPE_LABELS: Record<FacilityType, string> = {
  hospital: 'Hospital',
  police: 'Police Station',
  fire_station: 'Fire Station',
  clinic: 'Clinic',
  government: 'Government Office',
};

export function FacilityPopup({
  name,
  type,
  address,
  openingHours,
  phone,
}: FacilityPopupProps) {
  const colorClass = TYPE_COLORS[type] || TYPE_COLORS.government;
  const typeLabel = TYPE_LABELS[type] || 'Facility';

  return (
    <div className="w-64 overflow-hidden rounded-lg border bg-white shadow-lg">
      <div className={`border-b px-4 py-2 ${colorClass}`}>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">{typeLabel}</span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-bold text-gray-900">{name}</h3>

        {address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{address}</span>
          </div>
        )}

        {openingHours && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{openingHours}</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 flex-shrink-0 text-gray-600" />
            <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
              {phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
