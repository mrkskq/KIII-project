export function getCarrierInitials(carrier: string): string {
  return carrier
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function getCarrierColor(carrier: string): string {
  const colors = ["#1d4ed8", "#0369a1", "#0f766e", "#15803d", "#7e22ce", "#be123c", "#b45309", "#0c4a6e"];

  let hash = 0;
  for (const ch of carrier) hash += ch.charCodeAt(0);

  return colors[hash % colors.length];
}
