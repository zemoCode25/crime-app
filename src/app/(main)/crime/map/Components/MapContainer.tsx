"use client";
import { useState } from "react";
import Map from "./MainMap";
import MapSetting from "./MapSetting";
import { SelectedLocation } from "@/types/map";
import MapFilters from "./MapFIlters";

export default function MapContainer() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const handleLocationChange = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };

  return (
    <div className="relative mt-10 flex gap-4">
      <div className="flex w-full flex-col gap-2">
        <MapFilters
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
        />
        <Map
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
        />
      </div>
      <MapSetting
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
}
