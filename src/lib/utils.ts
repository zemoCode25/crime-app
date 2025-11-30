import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash, randomBytes, timingSafeEqual } from "crypto";

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

export function compareHashedToken(rawToken: string, storedHashedToken?: string | null): boolean {
  const hashedInput = hashToken(rawToken);

  // Convert both to Buffers for timing-safe comparison
  const a = Buffer.from(hashedInput, "hex");
  const b = Buffer.from(storedHashedToken ?? "", "hex");

  // Timing-safe comparison (prevents timing attacks)
  return a.length === b.length && timingSafeEqual(a, b);
}