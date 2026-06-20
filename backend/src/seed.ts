import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import { BusRouteModel } from "./models/BusRoute";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/busly";

async function seed() {
  await mongoose.connect(MONGO_URI);
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../scraped_data/bus_routes.json"), "utf-8"));
  await BusRouteModel.deleteMany({});
  await BusRouteModel.insertMany(data);
  console.log(`Seeded ${data.length} routes`);
  await mongoose.disconnect();
}

seed().catch(console.error);
