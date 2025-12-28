import Hotline from "./hotline";
import Status from "./status";
import CrimeType from "./crime-type";

export default function ConfigurationPage() {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <Hotline />
      <CrimeType />
      <Status />
    </div>
  );
}
