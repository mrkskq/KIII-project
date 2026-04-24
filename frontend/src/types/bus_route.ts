export interface BusRoute {
  time: string;
  destination: string;
  carrier: string;
  price: number;
  returnPrice: number;
}

export interface SearchParams {
  to: string;
  date: string; // YYYY-MM-DD
  passengers: number;
}
