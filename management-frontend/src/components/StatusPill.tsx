export function StatusPill({ value }: { value: string }) {
  return <span className={`pill ${value.toLowerCase() === "pending" ? "pending" : value.toLowerCase() === "cancelled" ? "cancelled" : ""}`}>{value.replaceAll("_", " ")}</span>;
}
