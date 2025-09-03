import { useState } from "react";

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState("sms");

  return (
    <div>
      <h2 className="text-xl font-bold">Emergency Page</h2>
      <p>Current emergency type: {emergencyType}</p>
    </div>
  );
}
