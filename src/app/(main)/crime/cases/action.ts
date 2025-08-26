import { getCrimeCases } from "@/lib/queries/crime";

export async function getTableCases() {
  const result = await getCrimeCases();

  const data = result.map((item) => {
    // item.case_person is assumed to be an array
    const suspect = item.case_person?.find((cp) => cp.case_role === "suspect");
    const complainant = item.case_person?.find(
      (cp) => cp.case_role === "complainant"
    );

    // console.log("Transformed data:", suspect?.person_profile);
    // console.log("Transformed data:", complainant?.person_profile);

    const suspectFirstName = suspect?.person_profile?.first_name ?? null;
    const suspectLastName = suspect?.person_profile?.last_name ?? null;
    const complainantFirstName =
      complainant?.person_profile?.first_name ?? null;
    const complainantLastName = complainant?.person_profile?.last_name ?? null;

    const suspectName = `${suspectFirstName ?? ""} ${
      suspectLastName ?? ""
    }`.trim();
    const complainantName = `${complainantFirstName ?? ""} ${
      complainantLastName ?? ""
    }`.trim();

    console.log(suspectFirstName, suspectLastName);

    return {
      id: item.id,
      crime_type: item.crime_type,
      case_status: item.case_status,
      suspect: suspectName,
      complainant: complainantName,
    };
  });
  // console.log(
  //   "result",
  //   result[2]?.case_person?.find((cp) => cp.case_role === "suspect")
  // );
  // console.log("Transformed data:", data);

  console.log("Final data for table:", data);

  return data;
}
