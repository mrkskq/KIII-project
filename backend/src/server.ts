import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { BusRouteModel } from "./models/BusRoute";
import { filterRoutes } from "../utils/filterRoutes";
import chatroutes from "./chat.routes";

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/chat", chatroutes);

app.get("/api/routes", async (req, res) => {
  const allRoutes = await BusRouteModel.find().lean();
  const result = filterRoutes(req.query, allRoutes as any);
  res.json({ count: result.length, routes: result });
});

app.get("/api/destinations", async (_req, res) => {
  const dests = await BusRouteModel.distinct("destination");
  res.json(dests);
});

app.get("/api/carriers", async (req, res) => {
  const to = String(req.query.to || "");
  const query = to ? { destination: { $regex: to, $options: "i" } } : {};
  const carriers = await BusRouteModel.distinct("carrier", query);
  res.json(carriers.sort());
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
});
