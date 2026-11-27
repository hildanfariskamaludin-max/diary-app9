const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Ubah "2026-11-24" menjadi "24 Nov 2026" tanpa terpengaruh timezone.
 */
export function formatDate(value?: string): string {
  if (!value) return "-";

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return value;

  return `${day} ${MONTHS[month - 1]} ${year}`;
}
