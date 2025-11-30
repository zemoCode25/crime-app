import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function EmailSentModal() {
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
