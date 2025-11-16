"use client";
import { useState, useEffect } from "react"; // ✅ Add useEffect
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import { DialogContent } from "@/components/ui/dialog";
import StepNavigation from "./StepNavigation";
import LocationInformation from "./multi-step/LocationInformation";
import MainButton from "@/components/utils/MainButton";
import { formSchema, type FormSchemaType } from "@/types/form-schema";
import { useUpdateCrimeCase } from "@/hooks/crime-case/useMutateCase";
import { defaultValues } from "@/lib/crime-case";
import { useCrimeCase } from "@/hooks/crime-case/useCrimeCase";
import type { CasePersonRecord } from "@/types/crime-case";

export default function UpdateCrimeCase({ caseId }: { caseId: number }) {
  const [step, setStep] = useState(0);

  const { data: crimeData, isLoading } = useCrimeCase(caseId);
  const crimeCaseMutation = useUpdateCrimeCase();

  // ✅ Initialize form with empty defaults first
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: defaultValues, // Use your existing defaultValues
  });

  const formFieldArray = useFieldArray({
    control: form.control,
    name: "persons",
  });

  // ✅ Reset form when crimeData is loaded
  useEffect(() => {
    if (crimeData && !isLoading) {
      const mapCasePersonToFormPerson = (
        casePerson: CasePersonRecord,
      ): FormSchemaType["persons"][number] => ({
        first_name: casePerson.person_profile?.first_name ?? "",
        last_name: casePerson.person_profile?.last_name ?? "",
        address: casePerson.person_profile?.address ?? "",
        civil_status: casePerson.person_profile?.civil_status || "single",
        contact_number: casePerson.person_profile?.contact_number ?? "",
        sex: casePerson.person_profile?.sex || "male",
        birth_date: casePerson.person_profile?.birth_date
          ? new Date(casePerson.person_profile.birth_date)
          : new Date(),
        person_notified: casePerson.person_profile?.person_notified ?? "",
        related_contact: casePerson.person_profile?.related_contact ?? "",
        case_role: casePerson.case_role || "complainant",
        motive: casePerson.suspect?.motive ?? "",
        weapon_used: casePerson.suspect?.weapon_used ?? "",
        narrative: casePerson.complainant?.narrative ?? "",
        testimony: casePerson.witness?.testimony ?? "",
      });

      const formData: FormSchemaType = {
        report_datetime: crimeData.report_datetime
          ? new Date(crimeData.report_datetime)
          : new Date(),
        incident_datetime: crimeData.incident_datetime
          ? new Date(crimeData.incident_datetime)
          : new Date(),
        description: crimeData.description || "",
        crime_type: crimeData.crime_type || 1,
        case_status: crimeData.case_status || "under investigation",
        investigator_notes: crimeData.investigator_notes || "",
        follow_up: crimeData.follow_up || "",
        remarks: crimeData.remarks || "",
        investigator: crimeData.investigator || "",
        responder: crimeData.responder || "",

        barangay: crimeData.location?.barangay || 1,
        visibility: crimeData.visibility || "private",
        crime_location: crimeData.location?.crime_location || "",
        landmark: crimeData.location?.landmark || "",

        pin: crimeData.location?.pin ?? undefined,
        lat: crimeData.location?.lat || 0,
        long: crimeData.location?.long || 0,

        persons: crimeData.case_person?.map(mapCasePersonToFormPerson) || [
          {
            first_name: "",
            last_name: "",
            address: "",
            civil_status: "single" as const,
            contact_number: "",
            sex: "male" as const,
            birth_date: new Date(), // ✅ Always a Date object
            person_notified: "",
            related_contact: "",
            case_role: "complainant" as const,
            motive: "",
            weapon_used: "",
            narrative: "",
            testimony: "",
          },
        ],
      };

      form.reset(formData);
    }
  }, [crimeData, isLoading, form]);
  if (isLoading) {
    return (
      <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
        <div className="flex items-center justify-center py-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <span className="ml-2">Loading crime case data...</span>
        </div>
      </DialogContent>
    );
  }

  if (!crimeData && !isLoading) {
    return (
      <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
        <div className="py-4 text-red-500">Failed to load crime case data.</div>
      </DialogContent>
    );
  }

  async function onSubmit(values: FormSchemaType) {
    try {
      // ✅ Prepare data for mutation
      const crimeCase = {
        case_number: `CASE-${Date.now()}`,
        crime_type: values.crime_type,
        case_status: values.case_status,
        description: values.description,
        incident_datetime: values.incident_datetime,
        report_datetime: values.report_datetime,
        investigator: values.investigator?.trim() || null,
        responder: values.responder?.trim() || null,
        investigator_notes: values.investigator_notes?.trim() || null,
        remarks: values.remarks?.trim() || null,
        follow_up: values.follow_up?.trim() || null,
        visibility: values.visibility,
      };

      const location = {
        barangay: values.barangay,
        crime_location: values.crime_location,
        landmark: values.landmark?.trim() || null,
        pin: values.pin || null,
        lat: values.lat,
        long: values.long,
      };

      const persons = values.persons.map((person) => ({
        first_name: person.first_name,
        last_name: person.last_name,
        birth_date: person.birth_date,
        sex: person.sex,
        civil_status: person.civil_status,
        address: person.address,
        contact_number: person.contact_number,
        case_role: person.case_role,
        person_notified: person.person_notified?.trim() || null,
        related_contact: person.related_contact?.trim() || null,
        motive: person.motive?.trim() || null,
        weapon_used: person.weapon_used?.trim() || null,
        narrative: person.narrative?.trim() || null,
        testimony: person.testimony?.trim() || null,
      }));

      // ✅ Trigger the mutation
      await crimeCaseMutation.mutateAsync({
        id: caseId,
        crimeCase,
        location,
        persons,
      });

      if (crimeCaseMutation.isError) {
        throw new Error("Failed to update crime case");
      }

      if (crimeCaseMutation.isSuccess) {
        console.log("Crime case update successful");
      }

      setStep(0);
    } catch (error) {
      // ✅ Error handling is managed by the mutation hook
      console.error("Form submission error", error);
    }
  }

  return (
    <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
      <Form {...form}>
        <StepNavigation setStep={setStep} step={step} />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-5 py-4"
        >
          {step === 0 && <CrimeForm />}
          {step === 1 && <PersonInformation formFieldArray={formFieldArray} />}
          {step === 2 && <LocationInformation />}
          {step === 3 && <AdditionalNotes />}

          {/* ✅ Submit button for last step */}
          {step === 3 && (
            <div className="pt-4">
              <MainButton
                type="submit"
                className="w-full"
                disabled={crimeCaseMutation.isPending} // ✅ Use mutation loading state
              >
                {crimeCaseMutation.isPending
                  ? "Updating..."
                  : "Update Crime Case"}
              </MainButton>
            </div>
          )}
        </form>
      </Form>
    </DialogContent>
  );
}
