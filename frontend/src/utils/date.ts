export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}
