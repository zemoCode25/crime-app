"use client";

import dynamic from "next/dynamic";

const MainMap = dynamic(() => import("./MainMap"), {
  ssr: false, // ✅ prevent SSR errors
});

export default function MapWrapper() {
  return (
    <div className="w-full">
      <MainMap />
    </div>
  );
}
