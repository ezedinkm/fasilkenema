// Normalize raw phone to local 10-digit format (09xxxxxxxx or 07xxxxxxxx)
export function normalizeEthiopianMobileLocal(raw: string): string | null {
  let d = String(raw || "").replace(/\D/g, ""); // remove all non-digits
  if (!d) return null;

  // Remove leading country code if present
  if (d.startsWith("251") && d.length > 9) {
    d = d.slice(3);
  }

  // Valid 10-digit local number starting with 09 or 07
  if (d.length === 10 && (d.startsWith("09") || d.startsWith("07"))) {
    return d;
  }

  // Valid 9-digit local number starting with 9 or 7 → add leading 0
  if (d.length === 9 && (d.startsWith("9") || d.startsWith("7"))) {
    return `0${d}`;
  }

  return null; // invalid number
}

// Check if phone is valid
export function isValidEthiopianMobile(raw: string): boolean {
  return normalizeEthiopianMobileLocal(raw) !== null;
}

// Convert local 10-digit phone to international format for SMS gateways
export function ethiopianLocalToInternational(local10: string): string {
  if (local10.length !== 10 || !local10.startsWith("0")) return local10;
  return `+251${local10.slice(1)}`;
}
