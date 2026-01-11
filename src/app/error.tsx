"use client";

import { useEffect } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="bg-destructive/20 absolute inset-0 animate-pulse rounded-full blur-xl"></div>
            <AlertCircle className="text-destructive relative h-24 w-24" />
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Oops! Something went wrong
        </h1>
        <p className="text-muted-foreground mb-2 text-lg">
          An unexpected error occurred while processing your request.
        </p>

        {error.message && (
          <div className="bg-destructive/10 mb-6 rounded-lg p-4 text-left">
            <p className="text-destructive font-mono text-sm">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {error.digest && (
          <div className="text-muted-foreground mt-12 text-sm">
            <p>Error ID: {error.digest}</p>
          </div>
        )}
      </div>
    </div>
  );
}
