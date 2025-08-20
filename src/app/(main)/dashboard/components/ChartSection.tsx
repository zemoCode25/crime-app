import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChartSection() {
  return (
    <div>
      <Tabs defaultValue="account" className="w-fit">
        <TabsList className="bg-neutral-200/50 dark:bg-neutral-900 gap-5 w-full">
          <TabsTrigger
            value="account"
            className="cursor-pointer active:bg-neutral-100 px-3"
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
