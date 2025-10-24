"use client";
import { useState } from "react";
import Map from "./MainMap";
import MapSetting from "./MapSetting";
import { SelectedLocation } from "@/types/map";

export default function MapContainer() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const handleLocationChange = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };
  return (
    <div className="relative mt-10 flex gap-4">
      <Map
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />
      <MapSetting
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />
    </div>
  );
}
