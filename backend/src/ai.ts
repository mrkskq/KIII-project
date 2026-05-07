import * as fs from "fs";
import { normalizeText } from "../utils/normalize";

const routes = JSON.parse(fs.readFileSync("./scraped_data/bus_routes.json", "utf-8"));

export function searchRoutes(data: any[], question: string) {
  const q = normalizeText(question);

  let result = data.filter((r) => {
    if (!r.destination) return false;
    return q.includes(normalizeText(r.destination));
  });

  if (result.length === 0) result = [...data];

  const carrierMatch = data.find((r) => {
    if (!r.carrier) return false;
    return q.includes(normalizeText(r.carrier));
  });

  if (carrierMatch) {
    result = result.filter((r) => r.carrier === carrierMatch.carrier);
  }

  if (q.includes("najeftin") || q.includes("najeftina") || q.includes("najevtin") || q.includes("najevtina")) {
    result = [...result].sort((a, b) => a.price - b.price);
    return [result[0]];
  }

  if (q.includes("povratna") || q.includes("povraten")) {
    const withReturn = result.filter((r) => r.returnPrice && r.returnPrice > 0);
    const cheapest = [...withReturn].sort((a, b) => a.returnPrice - b.returnPrice)[0];
    return cheapest ? [{ ...cheapest, note: "Повратна карта" }] : [];
  }

  if (q.includes("sledna") || q.includes("naredna") || q.includes("sleden") || q.includes("nareden")) {
    const now = new Date();
    const offset = 2;
    const referenceTime = ((now.getUTCHours() + offset) % 24).toString().padStart(2, "0") + ":" + now.getUTCMinutes().toString().padStart(2, "0");

    const next = [...result].filter((r) => r.time && r.time > referenceTime).sort((a, b) => a.time.localeCompare(b.time));

    return next.length ? [next[0]] : [];
  }

  if (q.includes("najrano") || q.includes("rano") || q.includes("najran")) {
    result = [...result].sort((a, b) => a.time.localeCompare(b.time));
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

export function askAI(question: string) {
  const matched = searchRoutes(routes, question);

  if (matched.length === 0) {
    return {
      answer: "Нема пронајдени линии за твоето прашање.",
      routes: [],
    };
  }

  const q = normalizeText(question);

  let answer = "";

  if (q.includes("sleden") || q.includes("nareden") || q.includes("sledna") || q.includes("naredna")) {
    answer = `Следниот автобус за ${matched[0].destination} е во ${matched[0].time} часот (${matched[0].price} ден.)`;
  } else if (q.includes("najeftin") || q.includes("najeftina") || q.includes("najevtin") || q.includes("najevtina")) {
    answer = `Најевтината линија за ${matched[0].destination} е ${matched[0].price} ден.`;
  } else if (q.includes("povratna") || q.includes("povraten")) {
    answer = `Повратна карта за ${matched[0].destination} има во ${matched[0].time} часот (${matched[0].price} ден.)`;
  } else if (q.includes("najrano") || q.includes("rano") || q.includes("najran")) {
    answer = `Најраниот автобус за ${matched[0].destination} е во ${matched[0].time} часот (${matched[0].price} ден.)`;
  } else {
    answer = `Прашај ме за следна/најевтина линија, за повратна карта или пак за најраниот автобус до твојата одбрана дестинација 😊`;
  }

  return { answer, routes: matched };
}
