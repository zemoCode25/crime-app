import { createContext, useContext } from "react";
import useSupabaseBrowser from "@/server/supabase/client";
import { getCrimeTypes } from "@/server/queries/crime-type";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";

interface CrimeTypeContextValue {
  crimeTypeConverter: (code: number) => string | null;
}

const CrimeTypeContext = createContext<CrimeTypeContextValue | undefined>(
  undefined,
);

export function CrimeTypeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseBrowser();
  const { data: crimeTypes } = useQuery(getCrimeTypes(supabase));
  // Function to convert crime type code to string
  const crimeTypeConverter = (code: number) => {
    const crimeType = crimeTypes?.find((type) => type.id === code);
    return crimeType ? crimeType.label : "Unknown";
  };

  return (
    <CrimeTypeContext.Provider value={{ crimeTypeConverter }}>
      {children}
    </CrimeTypeContext.Provider>
  );
}
export function useCrimeType() {
  const context = useContext(CrimeTypeContext);
  if (!context) {
    throw new Error("useCrimeType must be used within a CrimeTypeProvider");
  }
  return context;
}
