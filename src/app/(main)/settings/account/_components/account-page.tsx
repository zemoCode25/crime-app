import { Label } from "@/components/ui/label";
import Card from "@/components/utils/Card";
import LogoutModal from "@/components/utils/logout-modal";

export default function AccountPage() {
  return (
    <Card className="flex flex-col justify-start gap-4 p-4">
      <Label className="text-neutral-600">Log out to your account</Label>
      <LogoutModal />
    </Card>
  );
}
