import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash, randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateToken() {
  // 16 bytes -> 32 hex chars (sufficient for a bearer token)
  return randomBytes(16).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex"); // 64 hex chars
}