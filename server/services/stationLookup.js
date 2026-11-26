const calculateDistance = require("../utils/distanceCalculator");
const stations = require("../data/stations");
const { normalizeDepartments } = require("../utils/departments");
const { isValidCoordinates } = require("../utils/validation");

const cache = new Map();
const STATION_RADIUS_METERS = 25000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const AMENITY_TYPES = {
  police: "Police",
  hospital: "Ambulance",
  clinic: "Ambulance",
  fire_station: "Fire Brigade",
};

async function fetchOpenStreetMapStations(latitude, longitude) {
  const key = Math.round(latitude * 100) + ":" + Math.round(longitude * 100);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const query = [
    "[out:json][timeout:10];(",
    "nwr(around:" + STATION_RADIUS_METERS + "," + latitude + "," + longitude + ")[amenity~\"^(police|hospital|clinic|fire_station)$\"];",
    ");out center;",
  ].join("");
  const endpoint = process.env.OVERPASS_API_URL || "https://overpass-api.de/api/interpreter";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error("OpenStreetMap station lookup unavailable.");
  const payload = await response.json();
  const result = (payload.elements || []).map((place) => {
    const lat = Number(place.lat ?? place.center?.lat);
    const lon = Number(place.lon ?? place.center?.lon);
    const type = AMENITY_TYPES[place.tags?.amenity];
    if (!isValidCoordinates(lat, lon) || !type) return null;
    return {
      id: "osm-" + place.type + "-" + place.id,
      type,
      name: place.tags?.name || (
        type === "Ambulance" ? "Nearby medical facility" : "Nearby " + type + " facility"
      ),
      latitude: lat, longitude: lon,
      source: "openstreetmap",
      dispatchAvailable: false,
    };
  }).filter(Boolean);
  cache.set(key, { value: result, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  return result;
}

async function findNearbyStations(services, latitude, longitude, perService = 3) {
  if (!isValidCoordinates(latitude, longitude)) throw new Error("Valid coordinates required.");
  const requested = normalizeDepartments(services);
  if (!requested.length) return { stations: [], source: "unavailable" };

  let places = [];
  try {
    places = await fetchOpenStreetMapStations(Number(latitude), Number(longitude));
  } catch (error) {
    console.warn("Station lookup fallback:", error.message);
  }

  const result = [];
  for (const type of requested) {
    let matches = places.filter((place) => place.type === type);
    if (!matches.length) {
      matches = stations.filter((place) => place.type === type).map((place) => ({
        ...place, id: "sample-" + place.id, source: "sample",
        dispatchAvailable: false,
      })).filter((place) =>
        calculateDistance(Number(latitude), Number(longitude),
          place.latitude, place.longitude) <= 50
      );
    }
    result.push(...matches.map((station) => ({
      ...station,
      distanceKm: calculateDistance(
        Number(latitude), Number(longitude), station.latitude, station.longitude
      ),
    })).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, perService)
      .map((station) => ({
        ...station,
        distance: station.distanceKm.toFixed(2),
        distanceKm: Number(station.distanceKm.toFixed(2)),
      })));
  }
  const hasLive = result.some((station) => station.source === "openstreetmap");
  const hasSample = result.some((station) => station.source === "sample");
  const source = hasLive && hasSample ? "mixed" :
    hasLive ? "openstreetmap" : hasSample ? "sample" : "unavailable";
  return { stations: result, source };
}

module.exports = { findNearbyStations };
