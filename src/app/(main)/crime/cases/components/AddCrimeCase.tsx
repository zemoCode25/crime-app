"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

export default function MyForm() {
  const formSchema = z.object({
    description: z.string(),
    crime_type: z.string().min(1, "Crime type is required"),
    case_status: z.string().min(1, "Case status is required"),
    report_datetime: z.preprocess((val) => new Date(val as string), z.date()),
    incident_datetime: z.preprocess((val) => new Date(val as string), z.date()),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address: z.string().min(1, "Address is required"),
    civil_status: z.string().min(1, "Civil status is required"),
    contact_number: z
      .string()
      .max(12, "Contact number must be at most 12 characters"),
    sex: z.string().min(1, "Sex is required"),
    birth_date: z.coerce.date(),
    person_notified: z.string().optional(),
    related_contact: z.string().max(12).optional(),
    investigator_notes: z.string().optional(),
    follow_up: z.string().optional(),
    remarks: z.string().optional(),
    case_role: z.string().min(1, "Involvement is required"),
  });

  const form = useForm<
    z.input<typeof formSchema>,
    any,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_datetime: new Date(),
      incident_datetime: new Date(),
      first_name: "",
      last_name: "",
      address: "",
      civil_status: "",
      contact_number: "",
      sex: "",
      birth_date: new Date(),
      person_notified: "",
      related_contact: "",
      description: "",
      crime_type: "",
      case_status: "",
      investigator_notes: "",
      follow_up: "",
      remarks: "",
      case_role: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const [step, setStep] = useState(0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 text-white hover:bg-amber-500">
          <Plus /> Add crime record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[30rem] w-full overflow-y-scroll">
        <StepNavigation setStep={setStep} step={step} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-5 py-4"
          >
            {step === 0 && <CrimeForm form={form} />}
            {step === 1 && <PersonInformation form={form} />}
            {step === 2 && <AdditionalNotes form={form} onSubmit={onSubmit} />}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
