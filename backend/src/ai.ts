export function searchRoutes(data: any[], question: string) {
  const q = question.toLowerCase();

  let result = data;
  result = result.filter(r =>
    q.includes(r.destination.toLowerCase())
  );
  if (result.length === 0) {
    result = data;
  }
  const carrier = data.find(r =>
    q.includes(r.carrier.toLowerCase())
  );

  if (carrier) {
    result = result.filter(r =>
      r.carrier === carrier.carrier
    );
  }
  if (q.includes("najevtin") || q.includes("evtin")) {
    result = result.sort((a, b) => a.price - b.price);
  }

  if (q.includes("najran") || q.includes("rano")) {
    result = result.sort((a, b) => a.time.localeCompare(b.time));
  }

  return result;
}