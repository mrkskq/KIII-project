import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import type { BusRoute } from "./types/bus_route.js";

const URL = "https://ruleturs.techinreact.com/";
const RESULT = path.join(__dirname, "../scraped_data/bus_routes.json");

async function scrape(): Promise<void> {
  console.log("Fetching bus routes data...");

  const { data } = await axios.get(URL, {
    headers: { "Accept-Charset": "utf-8" },
    responseType: "arraybuffer",
  });

  // Bidejki sajtot e UTF-8 (kirilica), tuka go konvertirame
  const html = Buffer.from(data).toString("utf-8");
  const $ = cheerio.load(html);
  const bus_routes: BusRoute[] = [];

  $("table tr").each((_, row) => {
    const cols = $(row).find("td");

    if (cols.length !== 5) return; // time, destination, carrier, price, returnPrice

    const bus_route: BusRoute = {
      time: $(cols[0]).text().trim(),
      destination: $(cols[1]).text().trim(),
      carrier: $(cols[2]).text().trim(),
      price: Number($(cols[3]).text().trim()) || 0,
      returnPrice: Number($(cols[4]).text().trim()) || 0,
    };

    // Ignorirame prazni i header redovi
    if (bus_route.time && bus_route.destination) {
      bus_routes.push(bus_route);
    }
  });

  fs.mkdirSync(path.dirname(RESULT), { recursive: true }); // Pravi folder "scraped_data" ako ne postoi
  fs.writeFileSync(RESULT, JSON.stringify(bus_routes, null, 2), "utf-8"); // Vnatre gi zapisuva vo format na BusRoute (na kirilica)

  console.log(`Successfully scraped ${bus_routes.length} bus routes!`);
}

scrape().catch(console.error);
