import * as fs from "fs";
import * as path from "path";
import { normalizeText } from "../utils/normalize";
import { fuzzyMatch, damLev } from "../utils/fuzzy";
import type { BusRoute } from "./types/bus_route";
import { intentKeywords } from "../utils/intentKeywords";
 
const routes: BusRoute[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../scraped_data/bus_routes.json"), "utf-8")
);
 
// ─── Unique carriers & destinations lists ────────────────────────────────────
 
const uniqueCarriers: string[] = [...new Set(routes.map((r) => r.carrier).filter(Boolean))];
const uniqueDestinations: string[] = [...new Set(routes.map((r) => r.destination).filter(Boolean))];
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
type Intent =
  | "cheapest"
  | "next"
  | "return"
  | "earliest"
  | "carrier_list"   // "prevoznici za ohrid" – list carriers for a city
  | "carrier_routes" // "galeb" / "vakchare struga" – list destinations for a carrier
  | "general";
 
// ─── Intent detection ────────────────────────────────────────────────────────
 
function detectIntent(q: string): Intent {
  const words = q.split(" ");
 
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const matched = keywords.some(
      (keyword: string) =>
        q.includes(keyword) ||
        words.some((word) => {
          if (Math.abs(word.length - keyword.length) > 2) return false;
          return damLev(word, keyword) <= Math.max(1, Math.floor(keyword.length * 0.35));
        })
    );
    if (matched) return intent as Intent;
  }
 
  return "general";
}
 
// ─── Carrier detection (MUST run before city detection) ──────────────────────
//
// Strategy: try matching multi-word windows of the query against normalized
// carrier names, longest match wins.  This prevents "vakchare struga" from
// being interpreted as city "struga", and "klasik kompani" from being
// confused with "kochani" via fuzzy.
 
function detectCarrier(q: string): string | null {
  const words = q.split(" ");
  let bestCarrier: string | null = null;
  let bestScore = Infinity;
  let bestLen = 0;
 
  for (const carrier of uniqueCarriers) {
    const normCarrier = normalizeText(carrier);
    const carrierWords = normCarrier.split(" ");
    const windowSize = carrierWords.length;
 
    // Try every sliding window of the query that is the same length as this carrier name
    for (let i = 0; i <= words.length - windowSize; i++) {
      const window = words.slice(i, i + windowSize).join(" ");
 
      // Helper: is this candidate better than the current best?
      // Rule: LONGER match always wins over shorter, regardless of score.
      // Only compare scores when lengths are equal.
      const isBetter = (len: number, score: number) =>
        len > bestLen || (len === bestLen && score < bestScore);
 
      // Exact substring match – highest priority within same length
      if (matchesAsWholeWord(q, normCarrier) || normCarrier.includes(window)) {
        if (isBetter(windowSize, 0)) {
          bestCarrier = carrier;
          bestScore = 0;
          bestLen = windowSize;
        }
        continue;
      }
 
      // For single-word carriers: fuzzy match the single word
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
 
      // For multi-word carriers: compare window vs carrier word-by-word.
      // Every word in the carrier must fuzzy-match its counterpart in the window.
      const windowWords = window.split(" ");
      let totalDist = 0;
      let allMatch = true;
      for (let k = 0; k < carrierWords.length; k++) {
        const cw = carrierWords[k]!;
        const ww = windowWords[k]!;
        if (Math.abs(cw.length - ww.length) > 3) { allMatch = false; break; }
        const d = damLev(ww, cw);
        const maxD = Math.max(1, Math.floor(cw.length * 0.35));
        if (d > maxD) { allMatch = false; break; }
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
 
// ─── City detection ───────────────────────────────────────────────────────────
 
// Returns true only if normDest appears as whole word(s) in q, not as a substring of another word.
function matchesAsWholeWord(q: string, normDest: string): boolean {
  const re = new RegExp("(?<![\\w])(" + normDest.replace(/[-()]/g, "\\$&") + ")(?![\\w])");
  return re.test(q);
}
 
function detectCity(q: string): string | null {
  // Sort longest-first so "vladichin han" matches before "han"
  const sorted = [...uniqueDestinations].sort((a, b) => b.length - a.length);
  for (const dest of sorted) {
    const normDest = normalizeText(dest);
    if (matchesAsWholeWord(q, normDest)) return dest;
  }
  // Fuzzy per-word fallback (min 4 chars to avoid "da", "za", "vo" etc.)
  const words = q.split(" ");
  for (const dest of sorted) {
    const normDest = normalizeText(dest);
    if (words.some((w) => w.length >= 4 && fuzzyMatch(w, normDest))) return dest;
  }
  return null;
}
 
// ─── Core search ─────────────────────────────────────────────────────────────
 
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
    const referenceTime =
      ((now.getUTCHours() + offset) % 24).toString().padStart(2, "0") +
      ":" +
      now.getUTCMinutes().toString().padStart(2, "0");
    const next = [...result]
      .filter((r) => r.time && r.time > referenceTime)
      .sort((a, b) => a.time.localeCompare(b.time));
    return next.length ? [next[0]!] : [];
  }
  if (intent === "earliest") {
    const sorted = result.sort((a, b) => a.time.localeCompare(b.time));
    return sorted.length ? [sorted[0]!] : [];
  }
 
  // Deduplicate for "general"
  const seen = new Set<string>();
  return result.filter((r) => {
    const key = `${r.destination}-${r.time}-${r.carrier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
 
// ─── Format helpers ───────────────────────────────────────────────────────────
 
function formatAnswer(
  intent: Intent,
  route: BusRoute | undefined,
  hasDestination: boolean,
  destinationName: string
): string {
  if (!hasDestination) {
    return "Прашај ме за следна/најевтина линија, за повратна карта, за најраниот автобус или пак за превозник до твојата одбрана дестинација 😊";
  }
  if (!route || intent === "general") {
    return `Што конкретно те интересира за ${destinationName}? Најевтина цена, следно/најрано поаѓање или повратна карта?`;
  }
  if (intent === "next")
    return `Следниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;
  if (intent === "cheapest")
    return `Најевтината линија за ${route.destination} е ${route.price} ден.`;
  if (intent === "return")
    return `Повратна карта за ${route.destination} има во ${route.time} часот (${route.returnPrice} ден.)`;
  if (intent === "earliest")
    return `Најраниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;
 
  return "Прашај ме за следна/најевтина линија, за повратна карта, за најраниот автобус или пак за превозник до твојата одбрана дестинација 😊";
}
 
// ─── Main export ─────────────────────────────────────────────────────────────
 
export function askAI(question: string, context: string = "") {
  const q = normalizeText(question);
  const intent = detectIntent(q);
 
  // ── 1. Try to detect a carrier FIRST (before city) ───────────────────────
  const detectedCarrier = detectCarrier(q);
 
  if (detectedCarrier) {
    // ── 1a. carrier_routes intent: list all destinations for this carrier ──
    const carrierRoutes = routes.filter((r) => r.carrier === detectedCarrier);
    const carrierDests = [...new Set(carrierRoutes.map((r) => r.destination))];
 
    // Strip the carrier words from the query before looking for a city,
    // so "klasik kompani" doesn't accidentally fuzzy-match a city,
    // and "galeb ohrid za bitola" correctly finds Bitola as the destination.
    const normCarrierWords = normalizeText(detectedCarrier).split(" ");
    const qWords = q.split(" ");
    const qWithoutCarrier = qWords
      .filter((w) => !normCarrierWords.some((cw) => damLev(w, cw) <= Math.max(1, Math.floor(cw.length * 0.35))))
      .join(" ")
      .trim();
 
    const cityInQuestion = qWithoutCarrier.length > 0 ? detectCity(qWithoutCarrier) : null;
    const cityNorm = cityInQuestion ? normalizeText(cityInQuestion) : null;
 
    // If the query contains ONLY the carrier (no recognizable city) → show carrier destinations
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
        answer: `Превозникот **${detectedCarrier}** вози до следните дестинации:\n${carrierDests.map((d) => `• ${d}`).join("\n")}`,
        detectedCarrier,
        detectedCity: null,
        routes: carrierRoutes,
        mode: "carrier_routes" as const,
      };
    }
 
    // Carrier + city → filter to that carrier's routes for that city
    const filtered = carrierRoutes.filter((r) => normalizeText(r.destination) === cityNorm);
    const deduped = dedup(filtered);
    return {
      answer: deduped.length
        ? formatAnswer(intent, deduped[0], true, cityInQuestion!)
        : `Превозникот ${detectedCarrier} нема линии за ${cityInQuestion}.`,
      detectedCarrier,
      detectedCity: cityInQuestion,
      routes: deduped,
      mode: "carrier_city" as const,
    };
  }
 
  // ── 2. carrier_list intent: "prevoznici za ohrid" ────────────────────────
  if (intent === "carrier_list") {
    const cityInQuestion = detectCity(q);
    if (cityInQuestion) {
      const cityNorm = normalizeText(cityInQuestion);
      const cityRoutes = routes.filter((r) => normalizeText(r.destination) === cityNorm);
      const carriers = [...new Set(cityRoutes.map((r) => r.carrier))];
      return {
        answer:
          carriers.length > 0
            ? `Превозници за **${cityInQuestion}**:\n${carriers.map((c) => `• ${c}`).join("\n")}`
            : `Нема пронајдени превозници за ${cityInQuestion}.`,
        detectedCarrier: null,
        detectedCity: cityInQuestion,
        routes: cityRoutes,
        mode: "carrier_list" as const,
      };
    }
  }
 
  // ── 3. Normal city-based flow ─────────────────────────────────────────────
  const cityInQuestion = detectCity(q);
  const combined = cityInQuestion ? q : q + " " + normalizeText(context);
  const matched = searchRoutes(routes, combined);
 
  const matchedDestination =
    cityInQuestion ??
    routes.find(
      (r: BusRoute) =>
        r.destination &&
        (matchesAsWholeWord(combined, normalizeText(r.destination)) ||
          combined.split(" ").some((word: string) => word.length >= 4 && fuzzyMatch(word, normalizeText(r.destination))))
    )?.destination ??
    null;
 
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
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function dedup(arr: BusRoute[]): BusRoute[] {
  const seen = new Set<string>();
  return arr.filter((r) => {
    const key = `${r.destination}-${r.time}-${r.carrier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}