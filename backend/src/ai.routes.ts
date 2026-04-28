import express from "express";
import fs from "fs";
import { searchRoutes } from "./ai";

const router = express.Router();
const routes = JSON.parse(fs.readFileSync("./scraped_data/bus_routes.json", "utf-8"));

router.post("/ask", (req: any, res: any) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: "No question" });

  const matched = searchRoutes(routes, question);

  if (matched.length === 0) {
    return res.json({ answer: "Нема пронајдени линии за твоето прашање.", routes: [] });
  }

  const q = question.toLowerCase();

  let answerText = "";

  if (q.includes("следен") || q.includes("sleden") || q.includes("наредни") || q.includes("naredni")) {
    answerText = `Следен автобус: ${matched[0].destination} – ${matched[0].time} – ${matched[0].price} МКД.`;
  } else if (q.includes("најефтин") || q.includes("najeftin") || q.includes("evtin") || q.includes("ефтин")) {
    answerText = `Најефтина линија: ${matched[0].destination} – ${matched[0].time} – ${matched[0].price} МКД.`;
  } else if (q.includes("повратна") || q.includes("povratna")) {
    const withReturn = matched.filter((r) => r.returnPrice && r.returnPrice > 0);
    const cheapest = [...withReturn].sort((a, b) => a.returnPrice - b.returnPrice)[0];
    answerText = `Повратна карта: ${cheapest.destination} – ${cheapest.time} – ${cheapest.returnPrice} МКД.`;
  } else if (q.includes("најрано") || q.includes("najrano") || q.includes("rano")) {
    answerText = `Најран автобус: ${matched[0].destination} – ${matched[0].time} – ${matched[0].price} МКД.`;
  } else {
    answerText = `Пронајдени ${matched.length} линии за ${matched[0].destination}.`;
  }

  return res.json({ answer: answerText, routes: matched });
});

export default router;
