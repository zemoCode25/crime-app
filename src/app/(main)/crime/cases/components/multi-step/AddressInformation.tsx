"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false, // ✅ prevent SSR errors
});

export default function AddressInformation() {
  return (
    <div className="w-full p-4">
      <Map />
    </div>
  );
}
