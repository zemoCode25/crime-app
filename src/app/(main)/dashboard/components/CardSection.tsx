import { Card } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { TrendingUp } from "lucide-react";

export default function CardSection() {
  return (
    <div className="flex flex-row flex-wrap gap-4 sm:gap-6">
      <Card className="h-full w-[calc(50%-1rem)] !gap-0 p-4 md:w-[calc(25%-1.5rem)]">
        <h1>Total Crimes</h1>
        <p className="text-4xl font-bold">{2}</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground text-sm">-2 (2%)</span>
        </div>
      </Card>
      <Card className="h-full w-[calc(50%-1rem)] !gap-0 p-4 md:w-[calc(25%-1.5rem)]">
        <h1>Crime Rate</h1>
        <p className="text-4xl font-bold">5%</p>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-gray-700" />
          <span className="text-muted-foreground text-sm">22 (19%)</span>
        </div>
      </Card>
      <Card className="h-full w-[calc(50%-1rem)] !gap-0 p-4 md:w-[calc(27%-1.5rem)]">
        <h1 className="text-sm sm:text-base">Under Investigation</h1>
        <p className="text-4xl font-bold">20</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground text-sm">-2 (2%)</span>
        </div>
      </Card>
      <Card className="h-full w-[calc(50%-1rem)] !gap-0 p-4 md:w-[calc(23%-1.5rem)]">
        <h1>Settled Case</h1>
        <p className="text-4xl font-bold">40</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          <span className="text-muted-foreground text-sm">-2 (2%)</span>
        </div>
      </Card>
    </div>
  );
}
