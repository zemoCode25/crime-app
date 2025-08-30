"use client";

import dynamic from "next/dynamic";

const SimpleMapInner = dynamic(() => import("./AddressInformation"), {
  ssr: false, // ✅ prevent SSR errors
});

export default function MapWrapper() {
  return (
    <div className="w-full p-4">
      <SimpleMapInner />
    </div>
  );
}
