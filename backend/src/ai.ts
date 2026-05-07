import * as fs from "fs";
import * as path from "path";
import { normalizeText } from "../utils/normalize";
import type { BusRoute } from "./types/bus_route";

const routes = JSON.parse(fs.readFileSync(path.join(__dirname, "../scraped_data/bus_routes.json"), "utf-8"));

type Intent = "cheapest" | "next" | "return" | "earliest" | "general";

function detectIntent(q: string): Intent {
  if (q.includes("najeftin") || q.includes("najeftina") || q.includes("najevtin") || q.includes("najevtina")) return "cheapest";
  if (q.includes("sledna") || q.includes("naredna") || q.includes("sleden") || q.includes("nareden")) return "next";
  if (q.includes("povratna") || q.includes("povraten")) return "return";
  if (q.includes("najrano") || q.includes("rano") || q.includes("najran")) return "earliest";
  return "general";
}

export function searchRoutes(data: BusRoute[], question: string): BusRoute[] {
  const q = normalizeText(question);
  const intent = detectIntent(q);

  let result = data.filter((r) => r.destination && q.includes(normalizeText(r.destination)));
  if (result.length === 0) result = [...data];

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

function formatAnswer(intent: Intent, route: BusRoute | undefined): string {
  if (!route) return "Нема пронајдени линии за твоето прашање.";

  if (intent === "next") return `Следниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;
  if (intent === "cheapest") return `Најевтината линија за ${route.destination} е ${route.price} ден.`;
  if (intent === "return") return `Повратна карта за ${route.destination} има во ${route.time} часот (${route.returnPrice} ден.)`;
  if (intent === "earliest") return `Најраниот автобус за ${route.destination} е во ${route.time} часот (${route.price} ден.)`;

  return "Прашај ме за следна/најевтина линија, за повратна карта или пак за најраниот автобус до твојата одбрана дестинација 😊";
}

export function askAI(question: string) {
  const q = normalizeText(question);
  const intent = detectIntent(q);
  const matched = searchRoutes(routes, question);

  if (matched.length === 0) {
    return { answer: "Нема пронајдени линии за твоето прашање.", routes: [] };
  }

  return {
    answer: formatAnswer(intent, matched[0]),
    routes: matched,
  };
}
