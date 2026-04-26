import express from "express";
import fs from "fs";

const router = express.Router();
const routes = JSON.parse(
  fs.readFileSync("./scraped_data/bus_routes.json", "utf-8")
);

// helper
function hasValidDestination(question: string, routes: any[]) {
  const q = question.toLowerCase();

  return routes.some(r =>
    r.destination &&
    q.includes(r.destination.toLowerCase())
  );
}

router.post("/ask", (req: any, res: any) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "No question" });
  }

  const q = question.toLowerCase();

  const matched = routes.filter((r: any) =>
    r.destination &&
    q.includes(r.destination.toLowerCase())
  );

  if (matched.length === 0) {
    return res.json({
      answer: "Внеси правилен формат за прашање!",
      routes: []
    });
  }

  const cheapest = matched.reduce((min: any, r: any) =>
    r.price < min.price ? r : min
  , matched[0]);

  return res.json({
    answer: `Found ${matched.length} routes. Cheapest is ${cheapest.destination} at ${cheapest.price} MKD.`,
    routes: matched
  });
});

export default router;