// Strength calculator (0–100) based on 5 checks (20% each)
export function calcPasswordStrength(pw: string) {
  const { hasMinLen, hasUpper, hasLower, hasDigit, hasSpecial } =
    passwordChecks(pw);
  const score =
    (hasMinLen ? 20 : 0) +
    (hasUpper ? 20 : 0) +
    (hasLower ? 20 : 0) +
    (hasDigit ? 20 : 0) +
    (hasSpecial ? 20 : 0);
  return score; // 0..100
}


// Helper: requirement checks (added digit)
export function passwordChecks(pw: string) {
  const hasMinLen = pw.length >= 8 && pw.length <= 30;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const meetsRequirements =
    hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;
  return {
    hasMinLen,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    meetsRequirements,
  };
}