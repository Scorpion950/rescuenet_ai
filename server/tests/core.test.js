const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeDepartment, normalizeDepartments, departmentsForIncident } =
  require("../utils/departments");
const { isValidCoordinates, cleanText, normalizeSeverity } =
  require("../utils/validation");
const calculateDistance = require("../utils/distanceCalculator");
const { findNearbyStations } = require("../services/stationLookup");

test("canonical responder names prevent lowercase assignment mismatches", () => {
  assert.equal(normalizeDepartment("police"), "Police");
  assert.equal(normalizeDepartment("Fire Brigade"), "Fire Brigade");
  assert.equal(normalizeDepartment("AMBULANCE"), "Ambulance");
  assert.deepEqual(normalizeDepartments(["police", "Police", "fire", "ambulance", "unknown"]),
    ["Police", "Fire Brigade", "Ambulance"]);
  assert.deepEqual(departmentsForIncident("Road Accident"), ["Ambulance", "Police"]);
});

test("validate coordinates and model-provided severity", () => {
  assert.equal(isValidCoordinates(18.53, 73.85), true);
  assert.equal(isValidCoordinates(99, 73.85), false);
  assert.equal(isValidCoordinates(null, 73.85), false);
  assert.equal(isValidCoordinates(Number.NaN, 73.85), false);
  assert.equal(normalizeSeverity("critical"), "CRITICAL");
  assert.equal(normalizeSeverity("fake"), "UNASSESSED");
  assert.equal(cleanText(" hi ", 100), "hi");
});

test("Haversine distance is near zero at identical coordinates", () => {
  assert.equal(calculateDistance(18.53, 73.85, 18.53, 73.85), 0);
  const approximatelyOneDegree = calculateDistance(0, 0, 1, 0);
  assert.ok(approximatelyOneDegree > 110 && approximatelyOneDegree < 112);
});

test("OSM facilities are sorted by real proximity with canonical types", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ elements: [
      { type: "node", id: 501, lat: 18.6, lon: 73.8,
        tags: { amenity: "police", name: "Distant station" } },
      { type: "node", id: 502, lat: 18.5301, lon: 73.8501,
        tags: { amenity: "police", name: "Close station" } },
      { type: "node", id: 503, lat: 18.531, lon: 73.852,
        tags: { amenity: "hospital", name: "Nearby hospital" } },
    ] }),
  });
  try {
    const lookup = await findNearbyStations(["police", "ambulance"], 18.53, 73.85);
    assert.equal(lookup.source, "openstreetmap");
    assert.equal(lookup.stations.length, 3);
    assert.equal(lookup.stations[0].name, "Close station");
    assert.equal(lookup.stations[0].type, "Police");
    assert.equal(lookup.stations[1].name, "Distant station");
    assert.equal(lookup.stations[2].type, "Ambulance");
    assert.equal(lookup.stations[0].dispatchAvailable, false);
    assert.ok(lookup.stations[0].distanceKm < lookup.stations[1].distanceKm);
  } finally {
    global.fetch = originalFetch;
  }
});

test("distant locations do not receive a misleading hardcoded station", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error("Overpass is offline"); };
  try {
    const lookup = await findNearbyStations(["Police", "Ambulance"], 40.7128, -74.0060);
    assert.equal(lookup.source, "unavailable");
    assert.deepEqual(lookup.stations, []);
  } finally {
    global.fetch = originalFetch;
  }
});
