"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import CrimeForm from "./multi-step/CrimeForm";
import PersonInformation from "./multi-step/PersonInformation";
import AdditionalNotes from "./multi-step/AdditionalNotes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StepNavigation from "./StepNavigation";
export default function MyForm() {
  const languages = [
    {
      label: "English",
      value: "en",
    },
    {
      label: "French",
      value: "fr",
    },
    {
      label: "German",
      value: "de",
    },
    {
      label: "Spanish",
      value: "es",
    },
    {
      label: "Portuguese",
      value: "pt",
    },
    {
      label: "Russian",
      value: "ru",
    },
    {
      label: "Japanese",
      value: "ja",
    },
    {
      label: "Korean",
      value: "ko",
    },
    {
      label: "Chinese",
      value: "zh",
    },
  ] as const;

  const formSchema = z.object({
    description: z.string(),
    crime_type: z.string(),
    case_status: z.string(),
    report_datetime: z.preprocess((val) => new Date(val as string), z.date()),
    incident_datetime: z.preprocess((val) => new Date(val as string), z.date()),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<
    z.input<typeof formSchema>, // what comes *in* (string/unknown)
    any,
    z.output<typeof formSchema> // what comes *out* (coerced Date)
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_datetime: new Date(),
      incident_datetime: new Date(),
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

  const stepFormMap: Record<
    number,
    { title: string; formComponent: React.ReactNode }
  > = {
    0: {
      title: "Crime Information",
      formComponent: <CrimeForm form={form} onSubmit={onSubmit} />,
    },
    1: { title: "Person Information", formComponent: <PersonInformation /> },
    2: { title: "Additional Notes", formComponent: <AdditionalNotes /> },
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 text-white hover:bg-amber-500">
          <Plus /> Add crime record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <StepNavigation setStep={setStep} step={step} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-3xl space-y-8 py-10"
          >
            {stepFormMap[step].formComponent}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
