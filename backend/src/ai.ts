import * as fs from "fs";
import * as path from "path";
import { normalizeText } from "../utils/normalize";
import { fuzzyMatch, damLev } from "../utils/fuzzy";
import type { BusRoute } from "./types/bus_route";
import { intentKeywords } from "../utils/intentKeywords";

const routes: BusRoute[] = JSON.parse(fs.readFileSync(path.join(__dirname, "../scraped_data/bus_routes.json"), "utf-8"));

const uniqueCarriers: string[] = [...new Set(routes.map((r) => r.carrier).filter(Boolean))];
const uniqueDestinations: string[] = [...new Set(routes.map((r) => r.destination).filter(Boolean))];

type Intent = "cheapest" | "next" | "return" | "earliest" | "carrier_list" | "carrier_routes" | "general";

function detectIntent(q: string): Intent {
  const words = q.split(" ");

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const matched = keywords.some(
      (keyword: string) =>
        q.includes(keyword) ||
        words.some((word) => {
          if (Math.abs(word.length - keyword.length) > 2) return false;
          return damLev(word, keyword) <= Math.max(1, Math.floor(keyword.length * 0.35));
        }),
    );
    if (matched) return intent as Intent;
  }

  return "general";
}

// primer go fakja "ГАЛЕБ ОХРИД" kako prevoznik pred "ОХРИД" kako grad, spored longest match
function detectCarrier(q: string): string | null {
  const words = q.split(" ");
  let bestCarrier: string | null = null;
  let bestScore = Infinity;
  let bestLen = 0;

  for (const carrier of uniqueCarriers) {
    const normCarrier = normalizeText(carrier);
    const carrierWords = normCarrier.split(" ");
    const windowSize = carrierWords.length;

    for (let i = 0; i <= words.length - windowSize; i++) {
      const window = words.slice(i, i + windowSize).join(" ");

      const isBetter = (len: number, score: number) => len > bestLen || (len === bestLen && score < bestScore);

      if (matchesAsWholeWord(q, normCarrier)) {
        if (isBetter(windowSize, 0)) {
          bestCarrier = carrier;
          bestScore = 0;
          bestLen = windowSize;
        }
        continue;
      }

      // za prevoznici so eden zbor
      if (windowSize === 1) {
        const word = words[i]!;
        if (word.length < 4) continue;
        if (Math.abs(word.length - normCarrier.length) > 3) continue;
        const dist = damLev(word, normCarrier);
        const maxDist = Math.max(1, Math.floor(normCarrier.length * 0.3));
        if (dist <= maxDist && isBetter(windowSize, dist)) {
          bestCarrier = carrier;
          bestScore = dist;
          bestLen = windowSize;
        }
        continue;
      }

      // za prevoznici so povekje zborovi
      const windowWords = window.split(" ");
      let totalDist = 0;
      let allMatch = true;
      for (let k = 0; k < carrierWords.length; k++) {
        const cw = carrierWords[k]!;
        const ww = windowWords[k]!;
        if (Math.abs(cw.length - ww.length) > 3) {
          allMatch = false;
          break;
        }
        const d = damLev(ww, cw);
        const maxD = Math.max(1, Math.floor(cw.length * 0.35));
        if (d > maxD) {
          allMatch = false;
          break;
        }
        totalDist += d;
      }
      if (allMatch && isBetter(windowSize, totalDist)) {
        bestCarrier = carrier;
        bestScore = totalDist;
        bestLen = windowSize;
      }
    }
  }

  return bestCarrier;
}

// go vrakja gradot ako se pojavuva kako cel zbor a ne kako podstring na drug zbor
function matchesAsWholeWord(q: string, normDest: string): boolean {
  const re = new RegExp("(?<![\\w])(" + normDest.replace(/[-()]/g, "\\$&") + ")(?![\\w])");
  return re.test(q);
}

function detectCity(q: string): string | null {
  // sortiraj gi spored longest-first prevoznicite
  const sorted = [...uniqueDestinations].sort((a, b) => b.length - a.length);
  for (const dest of sorted) {
    const normDest = normalizeText(dest);
    if (matchesAsWholeWord(q, normDest)) return dest;
  }

  // za stringovi kako "da", "ne" koi se podstringovi na nekoj grad ili prevoznik
  const words = q.split(" ");
  for (const dest of sorted) {
    const normDest = normalizeText(dest);
    if (words.some((w) => w.length >= 4 && fuzzyMatch(w, normDest))) return dest;
  }
  return null;
}

export function searchRoutes(data: BusRoute[], question: string): BusRoute[] {
  const q = normalizeText(question);
  const intent = detectIntent(q);

  let result = data.filter((r) => {
    if (!r.destination) return false;
    const dest = normalizeText(r.destination);
    if (matchesAsWholeWord(q, dest)) return true;
    return q.split(" ").some((word) => word.length >= 4 && fuzzyMatch(word, dest));
  });

  const carrier = detectCarrier(q);
  if (carrier) {
    result = result.filter((r) => r.carrier === carrier);
  }

  if (intent === "cheapest") {
    const sorted = result.sort((a, b) => a.price - b.price);
    return sorted.length ? [sorted[0]!] : [];
  }
  if (intent === "return") {
    const withReturn = result.filter((r) => r.returnPrice && r.returnPrice > 0);
    const cheapest = withReturn.sort((a, b) => a.returnPrice - b.returnPrice)[0];
    return cheapest ? [cheapest] : [];
  }
  if (intent === "next") {
    const now = new Date();
    const offset = 2;
    const referenceTime = ((now.getUTCHours() + offset) % 24).toString().padStart(2, "0") + ":" + now.getUTCMinutes().toString().padStart(2, "0");
    const next = [...result].filter((r) => r.time && r.time > referenceTime).sort((a, b) => a.time.localeCompare(b.time));
    return next.length ? [next[0]!] : [];
  }
  if (intent === "earliest") {
    const sorted = result.sort((a, b) => a.time.localeCompare(b.time));
    return sorted.length ? [sorted[0]!] : [];
  }

  const seen = new Set<string>();
  return result.filter((r) => {
    const key = `${r.destination}-${r.time}-${r.carrier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatAnswer(intent: Intent, route: BusRoute | undefined, hasDestination: boolean, destinationName: string): string {
  if (!hasDestination) {
    return `Прашај ме за следна/најевтина линија, за повратна карта, за најраниот автобус или пак за превозник до твојата одбрана дестинација.`;
  }
  if (!route || intent === "general") {
    return `Што конкретно те интересира за ${destinationName}? Најевтина цена, следно/најрано поаѓање, повратна карта или информации за превозник?`;
  }
  if (intent === "next") return `Следниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;
  if (intent === "cheapest") return `Најевтината линија за ${route.destination} е ${route.price} ден.`;
  if (intent === "return") return `Повратна карта за ${route.destination} има во ${route.time} часот (${route.returnPrice} ден.)`;
  if (intent === "earliest") return `Најраниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;

  return `Прашај ме за следна/најевтина линија, за повратна карта, за најраниот автобус или пак за превозник до твојата одбрана дестинација.`;
}

export function askAI(question: string, context: string = "") {
  const q = normalizeText(question);
  const intent = detectIntent(q);

  // detektiraj prevoznik pred grad
  const detectedCarrier = detectCarrier(q);

  if (detectedCarrier) {
    const carrierRoutes = routes.filter((r) => r.carrier === detectedCarrier);
    const carrierDests = [...new Set(carrierRoutes.map((r) => r.destination))];

    const normCarrierWords = normalizeText(detectedCarrier).split(" ");
    const qWords = q.split(" ");
    const qWithoutCarrier = qWords
      .filter((w) => !normCarrierWords.some((cw) => damLev(w, cw) <= Math.max(1, Math.floor(cw.length * 0.35))))
      .join(" ")
      .trim();

    const cityInQuestion = qWithoutCarrier.length > 0 ? detectCity(qWithoutCarrier) : null;
    const cityNorm = cityInQuestion ? normalizeText(cityInQuestion) : null;

    // ako nema grad vo prevoznikot
    if (!cityInQuestion) {
      if (carrierDests.length === 0) {
        return {
          answer: `Нема пронајдени линии за превозникот ${detectedCarrier}.`,
          detectedCarrier,
          detectedCity: null,
          routes: [],
          mode: "carrier_routes" as const,
        };
      }
      return {
        answer: `Превозникот ${detectedCarrier} вози до следните дестинации:\n${carrierDests.map((d) => `, ${d}`).join("\n")}`,
        detectedCarrier,
        detectedCity: null,
        routes: carrierRoutes,
        mode: "carrier_routes" as const,
      };
    }

    const filtered = carrierRoutes.filter((r) => normalizeText(r.destination) === cityNorm);
    const deduped = dedup(filtered);
    return {
      answer: deduped.length ? formatAnswer(intent, deduped[0], true, cityInQuestion!) : `Превозникот ${detectedCarrier} нема линии за ${cityInQuestion}.`,
      detectedCarrier,
      detectedCity: cityInQuestion,
      routes: deduped,
      mode: "carrier_city" as const,
    };
  }

  if (intent === "carrier_list") {
    const cityInQuestion = detectCity(q);
    if (cityInQuestion) {
      const cityNorm = normalizeText(cityInQuestion);
      const cityRoutes = routes.filter((r) => normalizeText(r.destination) === cityNorm);
      const carriers = [...new Set(cityRoutes.map((r) => r.carrier))];
      return {
        answer: carriers.length > 0 ? `Превозници за ${cityInQuestion}: ${carriers.join(", ")}` : `Нема пронајдени превозници за ${cityInQuestion}.`,
        detectedCarrier: null,
        detectedCity: cityInQuestion,
        routes: cityRoutes,
        mode: "carrier_list" as const,
      };
    }
  }

  const cityInQuestion = detectCity(q);
  const matched = searchRoutes(routes, q);

  const matchedDestination = cityInQuestion ?? null;

  const hasDestination = !!matchedDestination;
  const destinationName = matchedDestination ?? "";

  if (hasDestination && matched.length === 0) {
    return {
      answer: `Моментално нема пронајдени линии за ${destinationName}.`,
      detectedCarrier: null,
      detectedCity: destinationName,
      routes: [],
      mode: "general" as const,
    };
  }

  return {
    answer: formatAnswer(intent, matched[0], hasDestination, destinationName),
    detectedCarrier: null,
    detectedCity: destinationName,
    routes: matched,
    mode: "general" as const,
  };
}

function dedup(arr: BusRoute[]): BusRoute[] {
  const seen = new Set<string>();
  return arr.filter((r) => {
    const key = `${r.destination}-${r.time}-${r.carrier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
