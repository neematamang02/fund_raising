export function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function base64Decode(base64) {
  const normalized = String(base64 || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padLength = normalized.length % 4;
  const padded = padLength
    ? normalized + "=".repeat(4 - padLength)
    : normalized;
  const decoded = atob(padded);
  return JSON.parse(decoded);
}
