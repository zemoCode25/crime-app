import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { requestPasswordReset } from "@/server/queries/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function EmailSentModal() {
  async function handleTriggerClick(email: string) {
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        console.log("Password reset email sent successfully.");
      } else {
        console.error("Error sending password reset email:", result.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  const EmailSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  type EmailSchemaType = z.infer<typeof EmailSchema>;
  const form = useForm<EmailSchemaType>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Forgot your password?</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex w-full flex-col items-center justify-center">
            <h1>Email Sent!</h1>
            <p>
              Please check your email for further instructions to reset your
              password.
            </p>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
