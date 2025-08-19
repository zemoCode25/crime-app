import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChartSection() {
  return (
    <div>
      <Tabs defaultValue="account" className="w-fit">
        <TabsList className="bg-neutral-200 gap-5">
          <TabsTrigger
            value="account"
            className="cursor-pointer bg-neutral-200"
          >
            Theft
          </TabsTrigger>
          <TabsTrigger value="assault" className="cursor-pointer">
            Assault
          </TabsTrigger>
          <TabsTrigger value="homicide" className="cursor-pointer">
            Homicide
          </TabsTrigger>
          <TabsTrigger value="fraud" className="cursor-pointer">
            Fraud
          </TabsTrigger>
          <TabsTrigger value="burglary" className="cursor-pointer">
            Burglary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
