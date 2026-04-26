import express, { Request, Response } from "express";
import cors from "cors";
import * as fs from "fs";
import * as path from "path";
import type { BusRoute } from "./types/bus_route.js";
import aiRoutes from "./ai.routes";

// Kreirame server na porta 3001
const app = express();
const PORT = 3001;

// Dozvoluva na Vue frontend (5173) da prakja request do serverot (3001)
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/ai",aiRoutes);

const SCRAPED_DATA_PATH = path.join(__dirname, "../scraped_data/bus_routes.json");

if (!fs.existsSync(SCRAPED_DATA_PATH)) {
  console.log("Scraped data file not found. Run scraper first.");
  process.exit(1);
}

const bus_routes: BusRoute[] = JSON.parse(fs.readFileSync(SCRAPED_DATA_PATH, "utf-8"));

// Za filtriranje
function filterRoutes(query: any, data: BusRoute[]) {
  return data
    .filter((r) =>
      query.to ? r.destination.toLowerCase().includes(String(query.to).toLowerCase()) : true,
    )
    .filter((r) =>
      query.carrier ? r.carrier.toLowerCase().includes(String(query.carrier).toLowerCase()) : true,
    )
    .filter((r) => (query.minPrice ? r.price >= Number(query.minPrice) : true))
    .filter((r) => (query.maxPrice ? r.price <= Number(query.maxPrice) : true));
}

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
  const data = [...new Set(bus_routes.map((r) => r.carrier))];
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
