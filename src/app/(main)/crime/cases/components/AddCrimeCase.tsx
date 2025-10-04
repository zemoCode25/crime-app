"use client";
import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StepNavigation from "./StepNavigation";
import AddressInformation from "./multi-step/AddressInformation";
import MainButton from "@/components/utils/MainButton";
import { formSchema, type FormSchemaType } from "@/types/form-schema";
import { createCrimeCaseTransaction } from "@/lib/queries/crime";
import useSupabaseBrowser from "@/lib/supabase/client";

export default function MyForm() {
  // ✅ Move useSupabaseBrowser to the top level
  const supabase = useSupabaseBrowser();
  const [step, setStep] = useState(0);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ✅ Fix default values - remove undefined, use empty strings
      report_datetime: new Date().toISOString(),
      incident_datetime: new Date().toISOString(),
      description: "",
      crime_type: 1, // ✅ Change from undefined to empty string
      case_status: "under investigation", // ✅ Change from undefined to empty string
      investigator_notes: "",
      follow_up: "",
      remarks: "",
      investigator: "",
      responder: "",
      barangay: 1, // ✅ Change from undefined to empty string
      crime_location: "",
      landmark: "",
      pin: undefined, // This can stay undefined as it's optional
      lat: 0,
      long: 0,
      persons: [
        {
          first_name: "",
          last_name: "",
          address: "",
          civil_status: "single", // ✅ Change from undefined to empty string
          contact_number: "",
          sex: "male", // ✅ Change from undefined to empty string
          birth_date: new Date(), // ✅ Use ISO string if schema expects string
          person_notified: "",
          related_contact: "",
          case_role: "complainant", // ✅ Change from undefined to empty string
          motive: "",
          weapon_used: "",
          narrative: "",
          testimony: "",
        },
      ],
    },
  });

  const formFieldArray = useFieldArray({
    control: form.control,
    name: "persons",
  });

  async function onSubmit(values: FormSchemaType) {
    try {
      // ✅ Check if supabase is available
      if (!supabase) {
        console.error("Supabase client not available");
        return;
      }

      const crimeCase = {
        case_number: `CASE-${Date.now()}`,
        crime_type: values.crime_type,
        case_status: values.case_status,
        description: values.description,
        incident_datetime: values.incident_datetime,
        report_datetime: values.report_datetime,
        investigator: values.investigator,
        responder: values.responder,
        investigator_notes: values.investigator_notes,
        remarks: values.remarks,
        follow_up: values.follow_up,
      };

      const location = {
        barangay: values.barangay,
        crime_location: values.crime_location,
        landmark: values.landmark,
        pin: values.pin,
        lat: values.lat,
        long: values.long,
      };

      const persons = [...values.persons];

      console.log("Submitting form with values:", {
        crimeCase,
        location,
        persons,
      });

      // ✅ Use the supabase from the hook
      const result = await createCrimeCaseTransaction(
        supabase,
        crimeCase,
        location,
        persons,
      );

      // ✅ Fix the response handling
      if (result && !result.error) {
        console.log("Crime case created successfully:", result);
        form.reset();
        setStep(0);
      } else {
        console.error(
          "Failed to create crime case:",
          result?.error || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MainButton>
          <Plus />
          Add Crime Record
        </MainButton>
      </DialogTrigger>
      <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
        <StepNavigation setStep={setStep} step={step} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto w-fit space-y-5 py-4"
          >
            {step === 0 && <CrimeForm form={form} />}
            {step === 1 && (
              <PersonInformation form={form} formFieldArray={formFieldArray} />
            )}
            {step === 2 && <AddressInformation form={form} />}
            {step === 3 && <AdditionalNotes form={form} />}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
