import { MapContainer, TileLayer } from "react-leaflet";

export default function AddressInformation() {
  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={[14.451, 121.018]} // Alabang, Muntinlupa
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        />
      </MapContainer>
    </div>
  );
}
