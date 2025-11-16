"use client";
import { useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StepNavigation from "./StepNavigation";
import LocationInformation from "./multi-step/LocationInformation";
import MainButton from "@/components/utils/MainButton";
import { formSchema, type FormSchemaType } from "@/types/form-schema";
import { defaultValues } from "@/lib/crime-case";
import { useCreateCrimeCase } from "@/hooks/crime-case/useMutateCase";

export default function MyForm() {
  const [step, setStep] = useState(0);

  // ✅ Use TanStack Query mutation instead of direct function call
  const crimeCaseMutation = useCreateCrimeCase();

  const form = useForm<FormSchemaType>({
    // Cast resolver to avoid type incompatibility between
    // @hookform/resolvers and react-hook-form versions
    resolver: zodResolver(formSchema) as any,
    mode: "onChange",
    defaultValues: defaultValues,
  });

  const formFieldArray = useFieldArray({
    control: form.control,
    name: "persons",
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
    try {
      // ✅ Prepare data for mutation
      console.log("Preparing data for mutation with values:", values);
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

      console.log("Form submission successful");

      // ✅ Reset form on success (mutation handles toast notifications)
      form.reset();
      setStep(0);
    } catch (error) {
      // ✅ Error handling is managed by the mutation hook
      console.error("Form submission error", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <MainButton>
          <Plus />
          Add Crime Record
        </MainButton>
      </DialogTrigger>
      <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
        <Form {...form}>
          <StepNavigation setStep={setStep} step={step} />
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Form validation failed with errors:", errors);
            })}
            className="mx-auto w-full space-y-5 py-4"
          >
            {step === 0 && <CrimeForm />}
            {step === 1 && (
              <PersonInformation formFieldArray={formFieldArray} />
            )}
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
