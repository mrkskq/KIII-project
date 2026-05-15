import express, { Request, Response } from "express";
import cors from "cors";
import * as fs from "fs";
import * as path from "path";
import type { BusRoute } from "./types/bus_route.js";
import { filterRoutes } from "../utils/filterRoutes";
import chatroutes from "./chat.routes";

// Kreirame server na porta 3001
const app = express();
const PORT = 3001;

// Dozvoluva na Vue frontend (5173) da prakja request do serverot (3001)
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/chat", chatroutes);

const SCRAPED_DATA_PATH = path.join(__dirname, "../scraped_data/bus_routes.json");

if (!fs.existsSync(SCRAPED_DATA_PATH)) {
  console.log("Scraped data file not found. Run scraper first.");
  process.exit(1);
}

const bus_routes: BusRoute[] = JSON.parse(fs.readFileSync(SCRAPED_DATA_PATH, "utf-8"));

// GET /api/routes -> Vrakja lista na avtobuski ruti
app.get("/api/routes", (req, res) => {
  const result = filterRoutes(req.query, bus_routes);

  res.json({
    count: result.length,
    routes: result,
  });
});

// GET /api/destinations -> Vrakja lista na destinacii
app.get("/api/destinations", (_req, res) => {
  const data = [...new Set(bus_routes.map((r) => r.destination))];
  res.json(data);
});

// GET /api/carriers —> Vrakja lista na prevoznici
app.get("/api/carriers", (_req, res) => {
  const to = String(_req.query.to || "");
  const filtered = to ? bus_routes.filter((r) => r.destination.toLowerCase().includes(to.toLowerCase())) : bus_routes;
  const data = [...new Set(filtered.map((r) => r.carrier))].sort();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
