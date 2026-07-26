const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const pakistaniPhone = /(?<!\d)(?:\+92|0092|92)[\s-]?\d{3}[\s-]?\d{7}|(?<!\d)03\d{2}[\s-]?\d{7}(?!\d)/;
export type PrivacyViolation = "email" | "pakistani_phone";
export function inspectInternalMessage(message: string): PrivacyViolation[] { const violations: PrivacyViolation[] = []; if (email.test(message)) violations.push("email"); if (pakistaniPhone.test(message)) violations.push("pakistani_phone"); return violations; }
