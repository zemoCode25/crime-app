"use client";

import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false, // ✅ prevent SSR errors
});

export default function AddressInformation() {
  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Address</label>
        <Input placeholder="Enter address" />
      </div>
      <Map />
    </div>
  );
}
