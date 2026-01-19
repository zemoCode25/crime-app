"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReportDataAction } from "@/server/actions/reports";
import { ReportFilter } from "@/server/queries/reports";
import { DateRange } from "react-day-picker";
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Note: assuming textarea exists or use basic textarea. SHADCN usually is Textarea.
// I'll check components dir if it fails, but standard is Textarea. I'll use standard <textarea> styled or check later.
import { KPICards } from "./KPICards";
import { ReportCharts } from "./ReportCharts";
import { CrimeTypeTable } from "./CrimeTypeTable";
import { pdf } from "@react-pdf/renderer";
import { SystemReportPDF } from "./SystemReportPDF";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );
  const [date, setDate] = useState<Date>(new Date()); // For Daily/Weekly
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth()),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Calculate generic date range based on report type
  const dateRange: DateRange = React.useMemo(() => {
    if (reportType === "daily") {
      return { from: startOfDay(date), to: endOfDay(date) };
    }
    if (reportType === "weekly") {
      // Week starting from selected date (or week containing?) - Let's do week containing (start of week)
      const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return { from: start, to: end };
    }
    // Monthly
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));
    return { from: start, to: end };
  }, [reportType, date, selectedMonth, selectedYear]);

  // --- Data Fetching ---
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["crime-reports", reportType, dateRange.from, dateRange.to],
    queryFn: async () => {
      const filter: ReportFilter = {
        from: dateRange.from!,
        to: dateRange.to!,
      };

      const result = await fetchReportDataAction(filter);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const handleDownloadPDF = async () => {
    if (!data || !dateRange.from || !dateRange.to) return;

    try {
      setIsGeneratingPdf(true);
      const blob = await pdf(
        <SystemReportPDF
          data={data}
          dateRange={{ from: dateRange.from, to: dateRange.to }}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crime-report-${reportType}-${format(dateRange.from, "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );

  return (
    <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 sm:px-6 lg:px-8">
      {/* Header & Filters */}
      <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
        <div className="flex w-full flex-col gap-4 sm:w-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Crime Reports
            </h1>
            <p className="text-sm text-gray-500">
              {reportType === "monthly"
                ? `Data overview for ${months[parseInt(selectedMonth)]} ${selectedYear}`
                : `Data overview for ${format(dateRange.from!, "MMM dd, yyyy")} - ${format(dateRange.to!, "MMM dd, yyyy")}`}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Type Selector */}
            <Select
              value={reportType}
              onValueChange={(v: "daily" | "weekly" | "monthly") =>
                setReportType(v)
              }
            >
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional Inputs */}
            {reportType === "monthly" ? (
              <>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] bg-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              // Date Picker for Daily/Weekly
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start bg-white text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <Button
          onClick={handleDownloadPDF}
          disabled={isLoading || !data || isGeneratingPdf}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          {isGeneratingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export PDF
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-white/50 text-red-500">
          Error: {error?.message}
        </div>
      ) : data ? (
        <div className="flex flex-col gap-4">
          {/* KPI Cards */}
          <KPICards data={data} />

          {/* Row 1: Trends (Full Width) */}
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Daily Incident Trend
            </h3>
            <ReportCharts type="trend" data={data} />
          </div>

          {/* Row 2: Charts & Distribution */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Status Distribution */}
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Case Status
              </h3>
              <ReportCharts type="status" data={data} />
            </div>

            {/* Crime Type Table */}
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Apprehension by Type
              </h3>
              <CrimeTypeTable data={data.crimeDistribution} />
            </div>
          </div>

          {/* Row 3: Barangay (System Admin) */}
          {data.barangayDistribution.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Distribution by Barangay
              </h3>
              <ReportCharts type="barangay" data={data} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border text-gray-400">
          No data available for the selected range.
        </div>
      )}
    </div>
  );
}
