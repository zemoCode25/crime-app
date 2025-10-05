"use client";
import { useState } from "react";
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
import { useCrimeCaseMutation } from "@/hooks/useCrimeCaseMutation";
import toast, { Toaster } from "react-hot-toast";

export default function MyForm() {
  const [step, setStep] = useState(0);

  // ✅ Use TanStack Query mutation instead of direct function call
  const crimeCaseMutation = useCrimeCaseMutation();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      report_datetime: new Date().toISOString(),
      incident_datetime: new Date().toISOString(),
      description: "",
      crime_type: 1,
      case_status: "under investigation",
      investigator_notes: "",
      follow_up: "",
      remarks: "",
      investigator: "",
      responder: "",
      barangay: 1,
      crime_location: "",
      landmark: "",
      pin: undefined,
      lat: 0,
      long: 0,
      persons: [
        {
          first_name: "",
          last_name: "",
          address: "",
          civil_status: "single",
          contact_number: "",
          sex: "male",
          birth_date: new Date(),
          person_notified: "",
          related_contact: "",
          case_role: "complainant",
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

  // ✅ Enhanced validation function
  async function validateAllSteps(): Promise<boolean> {
    const isValid = await form.trigger(); // Trigger validation for all fields

    if (!isValid) {
      const errors = form.formState.errors;

      // Find which step has errors and navigate to it
      if (
        errors.description ||
        errors.crime_type ||
        errors.case_status ||
        errors.report_datetime ||
        errors.incident_datetime
      ) {
        setStep(0);
        toast.error("Please fix errors in Crime Information");
        return false;
      }

      if (errors.persons) {
        setStep(1);
        toast.error("Please fix errors in Person Information");
        return false;
      }

      if (
        errors.barangay ||
        errors.crime_location ||
        errors.lat ||
        errors.long
      ) {
        setStep(2);
        toast.error("Please fix errors in Address Information");
        return false;
      }

      toast.error("Please fix all form errors before submitting");
      return false;
    }

    return true;
  }

  async function onSubmit(values: FormSchemaType) {
    try {
      // ✅ Validate all steps before submission
      const isAllValid = await validateAllSteps();
      if (!isAllValid) {
        return;
      }

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

      console.log("Submitting form with values:", {
        crimeCase,
        location,
        persons,
      });

      // ✅ Trigger the mutation
      await crimeCaseMutation.mutateAsync({
        crimeCase,
        location,
        persons,
      });

      // ✅ Reset form on success (mutation handles toast notifications)
      form.reset();
      setStep(0);
    } catch (error) {
      // ✅ Error handling is managed by the mutation hook
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
        <Toaster position="top-center" />
        <StepNavigation setStep={setStep} step={step} form={form} />
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

            {/* ✅ Submit button for last step */}
            {step === 3 && (
              <div className="pt-4">
                <MainButton
                  type="submit"
                  className="w-full"
                  disabled={crimeCaseMutation.isPending} // ✅ Use mutation loading state
                >
                  {crimeCaseMutation.isPending
                    ? "Creating..."
                    : "Create Crime Case"}
                </MainButton>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
