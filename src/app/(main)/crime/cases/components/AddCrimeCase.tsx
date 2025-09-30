"use client";
import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

export default function MyForm() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Case data defaults
      report_datetime: new Date(),
      incident_datetime: new Date(),
      description: "",
      crime_type: "",
      case_status: "",
      investigator_notes: "",
      follow_up: "",
      remarks: "",
      investigator: "",
      responder: "",
      // Response data defaults
      // Location data defaults
      barangay: "",
      crime_location: "",
      landmark: "",
      pin: undefined,
      lat: 0,
      long: 0,
      // Persons defaults
      persons: [
        {
          first_name: "",
          last_name: "",
          address: "",
          civil_status: "",
          contact_number: "",
          sex: "",
          birth_date: new Date(),
          person_notified: "",
          related_contact: "",
          case_role: "",
          motive: "",
          weapon_used: "",
          narrative: "",
          testimony: "",
        },
      ],
    },
  });

  const watchPersons = form.watch();

  console.log(watchPersons);

  const formFieldArray = useFieldArray({
    control: form.control,
    name: "persons",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const [step, setStep] = useState(0);

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
