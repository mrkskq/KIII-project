import * as fs from "fs";
import * as path from "path";
import { normalizeText } from "../utils/normalize";
import { fuzzyMatch, damLev } from "../utils/fuzzy";
import type { BusRoute } from "./types/bus_route";
import { distance } from "fastest-levenshtein";
import { intentKeywords } from "../utils/intentKeywords";

const routes = JSON.parse(fs.readFileSync(path.join(__dirname, "../scraped_data/bus_routes.json"), "utf-8"));

type Intent = "cheapest" | "next" | "return" | "earliest" | "general";

function detectIntent(q: string): Intent {
  const words = q.split(" ");

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const matched = keywords.some(
      (keyword) =>
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

export function searchRoutes(data: BusRoute[], question: string): BusRoute[] {
  const q = normalizeText(question);
  const intent = detectIntent(q);

  let result = data.filter((r) => {
    if (!r.destination) return false;
    const dest = normalizeText(r.destination);
    if (q.includes(dest)) return true;
    return q.split(" ").some((word) => fuzzyMatch(word, dest));
  });

  const carrierMatch = data.find((r) => r.carrier && q.includes(normalizeText(r.carrier)));
  if (carrierMatch) {
    result = result.filter((r) => r.carrier === carrierMatch.carrier);
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
    return "Прашај ме за следна/најевтина линија, за повратна карта или пак за најраниот автобус до твојата одбрана дестинација 😊";
  }

  if (!route || intent === "general") {
    return `Што конкретно те интересира за ${destinationName}? Најевтина цена, следно/најрано поаѓање или повратна карта?`;
  }

  if (intent === "next") return `Следниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;
  if (intent === "cheapest") return `Најевтината линија за ${route.destination} е ${route.price} ден.`;
  if (intent === "return") return `Повратна карта за ${route.destination} има во ${route.time} часот (${route.returnPrice} ден.)`;
  if (intent === "earliest") return `Најраниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;

  return "Прашај ме за следна/најевтина линија, за повратна карта или пак за најраниот автобус до твојата одбрана дестинација 😊";
}

export function askAI(question: string, context: string = "") {
  const q = normalizeText(question);
  const intent = detectIntent(q);

  const cityInQuestion = routes.find(
    (r: BusRoute) => r.destination && (q.includes(normalizeText(r.destination)) || q.split(" ").some((word: string) => fuzzyMatch(word, normalizeText(r.destination)))),
  );

  const combined = cityInQuestion ? q : q + " " + normalizeText(context);
  const matched = searchRoutes(routes, combined);

  const matchedDestination =
    cityInQuestion ??
    routes.find((r: BusRoute) => r.destination && (combined.includes(normalizeText(r.destination)) || combined.split(" ").some((word: string) => fuzzyMatch(word, normalizeText(r.destination)))));

  const hasDestination = !!matchedDestination;
  const destinationName = matchedDestination?.destination ?? "";

  if (hasDestination && matched.length === 0) {
    return {
      answer: `Моментално нема пронајдени линии за ${destinationName}.`,
      detectedCity: destinationName,
      routes: [],
    };
  }

  return {
    answer: formatAnswer(intent, matched[0], hasDestination, destinationName),
    detectedCity: destinationName,
    routes: matched,
  };
}
