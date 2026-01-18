import { ReportData } from "@/server/queries/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Archive, CheckCircle2, ShieldAlert } from "lucide-react";

interface KPICardsProps {
  data: ReportData;
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: "Total Crimes",
      value: data.totalCrimes,
      desc: "Reported in selected period",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Solved Cases",
      value: data.solvedCount,
      desc: `${data.solvedCount > 0 && data.totalCrimes > 0 ? ((data.solvedCount / data.totalCrimes) * 100).toFixed(1) : 0}% clearance rate`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Unsolved / Open",
      value: data.unsolvedCount,
      desc: "Requires investigation",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Top Crime Type",
      value: data.topCrimeType,
      desc: "Most frequent incident",
      icon: Archive,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className="relative !gap-0 overflow-hidden rounded-md border-gray-200 bg-white !p-0 shadow-none"
        >
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div
              className="truncate text-xl font-bold text-gray-900"
              title={String(card.value)}
            >
              {card.value}
            </div>
            <p className="mt-1 text-[10px] text-gray-500">{card.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
