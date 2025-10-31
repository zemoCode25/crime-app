import { Button } from "../ui/button";
import { cn } from "@/lib/utils"; // if you're using shadcn's cn utility
import * as React from "react";

export default function MainButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      className={cn(
        "cursor-pointer bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600 focus:ring-offset-orange-200 dark:bg-orange-600/90 hover:dark:bg-orange-700/90 dark:focus:ring-offset-orange-900",
        className, // let user override if needed
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
