"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="mx-auto mt-20 flex w-full max-w-[40rem] flex-col">
      <header className="flex w-full justify-between">
        <Link
          href={"/settings/profile"}
          className={
            pathname === "/settings/profile"
              ? "font-medium text-orange-600 underline"
              : ""
          }
        >
          Profile
        </Link>
        <Link
          href={"/settings/configuration"}
          className={
            pathname === "/settings/configuration"
              ? "font-medium text-orange-600 underline"
              : ""
          }
        >
          Configuration
        </Link>
        <Link
          href={"/settings/landmark"}
          className={
            pathname === "/settings/landmark"
              ? "font-medium text-orange-600 underline"
              : ""
          }
        >
          Landmark
        </Link>
        <Link
          href={"/settings/account"}
          className={
            pathname === "/settings/account"
              ? "font-medium text-orange-600 underline"
              : ""
          }
        >
          Account
        </Link>
      </header>
      <div className="my-4">{children}</div>
    </div>
  );
}
