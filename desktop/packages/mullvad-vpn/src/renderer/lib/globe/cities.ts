export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { name: "São Paulo", country: "BR", lat: -23.55, lng: -46.63 },
  { name: "Rio de Janeiro", country: "BR", lat: -22.91, lng: -43.17 },
  { name: "New York", country: "US", lat: 40.71, lng: -74.0 },
  { name: "Los Angeles", country: "US", lat: 34.05, lng: -118.24 },
  { name: "Miami", country: "US", lat: 25.76, lng: -80.19 },
  { name: "London", country: "GB", lat: 51.5, lng: -0.13 },
  { name: "Amsterdam", country: "NL", lat: 52.37, lng: 4.9 },
  { name: "Frankfurt", country: "DE", lat: 50.11, lng: 8.68 },
  { name: "Madrid", country: "ES", lat: 40.42, lng: -3.7 },
  { name: "Paris", country: "FR", lat: 48.86, lng: 2.35 },
  { name: "Stockholm", country: "SE", lat: 59.33, lng: 18.07 },
  { name: "Zurich", country: "CH", lat: 47.38, lng: 8.55 },
  { name: "Tokyo", country: "JP", lat: 35.68, lng: 139.69 },
  { name: "Singapore", country: "SG", lat: 1.35, lng: 103.82 },
  { name: "Hong Kong", country: "HK", lat: 22.32, lng: 114.17 },
  { name: "Sydney", country: "AU", lat: -33.87, lng: 151.21 },
  { name: "Toronto", country: "CA", lat: 43.65, lng: -79.38 },
  { name: "Mexico City", country: "MX", lat: 19.43, lng: -99.13 },
  { name: "Buenos Aires", country: "AR", lat: -34.6, lng: -58.38 },
  { name: "Johannesburg", country: "ZA", lat: -26.2, lng: 28.04 },
];
