export default function CheckEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="bg-background mx-auto w-full max-w-lg rounded-lg border p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a confirmation link to your email. Click the link to finish
          creating your account.
        </p>
      </div>
    </div>
  );
}
