// "2026-09-06" → lokale datum (new Date("YYYY-MM-DD") rekent in UTC en kan een dag verschuiven)
export function parseLocalDate(dateString: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString || "");
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
