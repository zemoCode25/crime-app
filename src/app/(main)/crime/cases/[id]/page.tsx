import CasePage from "./_components/CasePage";
import { getCrimeCaseById } from "@/server/queries/crime";
import { createClient } from "@/server/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = await createClient(); // ✅ Added await
  const caseId = Number(params.id);

  const res = await getCrimeCaseById(supabase, caseId);
  const crimeCase = res.data;

  console.log("Fetched crime case:", crimeCase);

  if (!crimeCase || res.error) {
    notFound();
  }

  // ✅ Pass the actual data object to CasePage component
  return <CasePage crimeCase={crimeCase} />;
}
