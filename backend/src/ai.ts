export function searchRoutes(data: any[], question: string) {
  const q = question.toLowerCase();

  let result = data.filter((r) => r.destination && q.includes(r.destination.toLowerCase()));

  if (result.length === 0) result = [...data];

  const carrierMatch = data.find((r) => r.carrier && q.includes(r.carrier.toLowerCase()));
  if (carrierMatch) {
    result = result.filter((r) => r.carrier === carrierMatch.carrier);
  }

  if (q.includes("najeftin") || q.includes("evtin") || q.includes("ефтин") || q.includes("најефтин")) {
    result = [...result].sort((a, b) => a.price - b.price);
    return [result[0]];
  }

  if (q.includes("povratna") || q.includes("поврат")) {
    const withReturn = result.filter((r) => r.returnPrice && r.returnPrice > 0);
    const cheapest = [...withReturn].sort((a, b) => a.returnPrice - b.returnPrice)[0];
    return [{ ...cheapest, note: "Повратна карта" }];
  }


  if (q.includes("sleden") || q.includes("следен") || q.includes("naredni") || q.includes("наредни")) {
    const timeMatch = q.match(/(\d{1,2})[:.](\d{2})/);

    let referenceTime: string;
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      const h = timeMatch[1].padStart(2, "0");
      const m = timeMatch[2];
      referenceTime = `${h}:${m}`;
    } else {
      const now = new Date();
      const offset = 2;
      const localHours = (now.getUTCHours() + offset) % 24;
      referenceTime = localHours.toString().padStart(2, "0") + ":" + now.getUTCMinutes().toString().padStart(2, "0");
      // referenceTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    }


    const next = [...result]
      .filter((r) => {
        if (!r.time) return false;
        const [h, m] = r.time.split(":").map((x: string) => x.padStart(2, "0"));
        const normalizedTime = `${h}:${m}`;
        return normalizedTime > referenceTime;
      })
      .sort((a, b) => {
        const [ah, am] = a.time.split(":").map((x: string) => x.padStart(2, "0"));
        const [bh, bm] = b.time.split(":").map((x: string) => x.padStart(2, "0"));
        return `${ah}:${am}`.localeCompare(`${bh}:${bm}`);
      });

    return next.length > 0 ? [next[0]] : [];
  }

  if (q.includes("najrano") || q.includes("rano") || q.includes("рано") || q.includes("најрано")) {
    result = [...result].sort((a, b) => {
      const [ah, am] = a.time.split(":").map((x: string) => x.padStart(2, "0"));
      const [bh, bm] = b.time.split(":").map((x: string) => x.padStart(2, "0"));
      return `${ah}:${am}`.localeCompare(`${bh}:${bm}`);
    });
    return [result[0]];
  }

  const seen = new Set();
  return result.filter((r) => {
    const key = `${r.destination}-${r.time}-${r.carrier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
