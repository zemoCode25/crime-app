import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Card from "@/components/utils/Card";
import { logOutUser } from "@/server/actions/users";

export default function AccountPage() {
  return (
    <Card className="flex flex-col justify-start gap-4 p-4">
      <Label className="text-neutral-600">Log out to your account</Label>
      <form action={logOutUser}>
        <Button className="w-fit cursor-pointer" type="submit">
          Log out
        </Button>
      </form>
    </Card>
  );
}
