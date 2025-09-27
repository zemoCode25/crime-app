import React from "react";
import { Button } from "@/components/ui/button";
import { Send, LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmergencyCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonText?: string;
  className?: string;
  buttonIcon?: LucideIcon;
}

export default function EmergencyCard({
  title,
  description,
  href,
  icon: Icon,
  buttonText = "Send emergency",
  className,
  buttonIcon: ButtonIcon = Send,
}: EmergencyCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col !gap-0 rounded-sm border border-neutral-300 bg-white px-6 py-4 shadow-sm sm:w-[calc(33.333%_-_1rem)]",
        "dark:border-orange-900/30 dark:bg-[var(--dark-card)] dark:shadow-none",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Icon size={20} className="text-gray-700 dark:text-orange-300/70" />
        <h1 className="text-lg font-bold text-gray-900 dark:text-orange-50">
          {title}
        </h1>
      </div>
      <p className="mb-2 w-full text-sm text-gray-600 dark:text-orange-200/70">
        {description}
      </p>
      <Link href={href}>
        <Button className="flex w-fit cursor-pointer items-center gap-1 !text-xs">
          <p>{buttonText}</p>
          <ButtonIcon size={12} />
        </Button>
      </Link>
    </div>
  );
}
