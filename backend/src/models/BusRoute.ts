import mongoose from "mongoose";

const BusRouteSchema = new mongoose.Schema({
  destination: String,
  carrier: String,
  time: String,
  price: Number,
  returnPrice: Number,
  days: [String],
});

export const BusRouteModel = mongoose.model("BusRoute", BusRouteSchema);
