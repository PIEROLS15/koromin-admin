export function formatDate(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short" }).format(date);
}
