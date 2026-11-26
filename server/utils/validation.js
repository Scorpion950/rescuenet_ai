const isValidCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 &&
    latitude !== null && latitude !== undefined &&
    longitude !== null && longitude !== undefined;
};

const cleanText = (value, maxLength = 500) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const allowedSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const normalizeSeverity = (value) =>
  allowedSeverities.includes(String(value).toUpperCase())
    ? String(value).toUpperCase() : "UNASSESSED";

module.exports = { isValidCoordinates, cleanText, normalizeSeverity };
