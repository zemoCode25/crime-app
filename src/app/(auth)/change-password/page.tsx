import { Suspense } from "react";
import ChangePasswordPage from "./_components/ChangePasswordPage";

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-4">
      <Suspense fallback={null}>
        <ChangePasswordPage />
      </Suspense>
    </div>
  );
}
