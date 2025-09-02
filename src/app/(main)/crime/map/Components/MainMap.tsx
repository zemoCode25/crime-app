"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";

// Fix Leaflet icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function AddressInformation() {
  return (
    <MapContainer
      center={[14.3798, 121.0249]} // Alabang, Muntinlupa
      zoom={13}
      scrollWheelZoom={true}
      className="z-0 h-dvh w-full rounded-lg shadow-md"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[14.3794, 121.0249]} icon={redIcon}>
        <Popup className="!gap-2">
          <div className="flex flex-col gap-2">
            <div>
              <label className="font-semibold">Case Task:</label>
              <p className="!my-0">CASE-20250902-0001</p>
            </div>
            <div>
              <label className="font-semibold">Description:</label>
              <p className="!my-0">Crime description goes here.</p>
            </div>
            <div>
              <label className="font-semibold">Address:</label>
              <p className="!my-0">Crime address goes here.</p>
            </div>
            <Button className="bg-orange-600">View Details</Button>
          </div>
        </Popup>
      </Marker>
      <Marker position={[14.3798, 121.0249]}>
        <Popup className="!gap-2">
          <div className="flex flex-col gap-2">
            <div>
              <label className="font-semibold">Case Task:</label>
              <p className="!my-0">CASE-20250902-0001</p>
            </div>
            <div>
              <label className="font-semibold">Description:</label>
              <p className="!my-0">Crime description goes here.</p>
            </div>
            <div>
              <label className="font-semibold">Address:</label>
              <p className="!my-0">Crime address goes here.</p>
            </div>
            <Button className="bg-orange-600">View Details</Button>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
