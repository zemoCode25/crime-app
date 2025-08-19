import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";

export default function CardSection() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
      <Card className="w-full h-fit !gap-0 p-4">
        <h2>Total Crimes</h2>
        <p className="text-4xl font-bold">1</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-muted-foreground">-2 (2%)</span>
        </div>
      </Card>
      <Card className="w-full h-30 !gap-0 p-4">
        <h1>Crime Rate</h1>
        <p className="text-4xl font-bold">5%</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-gray-700" />
          <span className="text-sm text-muted-foreground">22 (19%)</span>
        </div>
      </Card>
      <Card className="w-full h-30 !gap-0 p-4">
        <h1>Under Investigation</h1>
        <p className="text-4xl font-bold">20</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-muted-foreground">-2 (2%)</span>
        </div>
      </Card>
      <Card className="w-full h-30 !gap-0 p-4">
        <h1>Settled Case</h1>
        <p className="text-4xl font-bold">40</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-muted-foreground">-2 (2%)</span>
        </div>
      </Card>
    </div>
  );
}
