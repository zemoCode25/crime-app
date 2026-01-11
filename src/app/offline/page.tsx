"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <WifiOff className="text-muted-foreground h-16 w-16" />
          </div>
        </div>

        <h1 className="text-foreground mb-2 text-2xl font-bold">
          You&apos;re Offline
        </h1>

        <p className="text-muted-foreground mb-8">
          Please check your internet connection and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
