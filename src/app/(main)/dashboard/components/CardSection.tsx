import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";

export default function CardSection() {
  return (
    <div className="flex flex-row flex-wrap gap-4 sm:gap-6">
      <Card className="w-[calc(50%-1rem)] md:w-[calc(25%-1.5rem)] h-full !gap-0 p-4">
        <h1>Total Crimes</h1>
        <p className="text-4xl font-bold">1</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-muted-foreground">-2 (2%)</span>
        </div>
      </Card>
      <Card className="w-[calc(50%-1rem)] md:w-[calc(25%-1.5rem)] h-full !gap-0 p-4">
        <h1>Crime Rate</h1>
        <p className="text-4xl font-bold">5%</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-gray-700" />
          <span className="text-sm text-muted-foreground">22 (19%)</span>
        </div>
      </Card>
      <Card className="w-[calc(50%-1rem)] md:w-[calc(27%-1.5rem)] h-full !gap-0 p-4">
        <h1 className="text-sm sm:text-base">Under Investigation</h1>
        <p className="text-4xl font-bold">20</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-sm text-muted-foreground">-2 (2%)</span>
        </div>
      </Card>
      <Card className="w-[calc(50%-1rem)] md:w-[calc(23%-1.5rem)] h-full !gap-0 p-4">
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
