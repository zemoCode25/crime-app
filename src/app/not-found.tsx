"use client";

import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="bg-destructive/20 absolute inset-0 animate-pulse rounded-full blur-xl"></div>
            <AlertTriangle className="text-destructive relative h-24 w-24" />
          </div>
        </div>

        <h1 className="mb-2 text-6xl font-bold tracking-tight">404</h1>
        <h2 className="text-foreground mb-4 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Please check the URL or return to the homepage.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </Button>
        </div>

        <div className="text-muted-foreground mt-12 text-sm">
          <p>Error Code: 404 - Resource Not Found</p>
        </div>
      </div>
    </div>
  );
}
