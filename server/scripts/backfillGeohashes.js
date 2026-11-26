// Safe dry-run default: node scripts/backfillGeohashes.js
// Explicit write:      node scripts/backfillGeohashes.js --apply
// Only updates existing reports missing geohash; does NOT opt users into alerts.
require("dotenv").config();
const db = require("../config/firebase");
const { geohashForLocation } = require("geofire-common");
const { isValidCoordinates } = require("../utils/validation");

async function main() {
  const apply = process.argv.includes("--apply");
  let cursor;
  let scanned = 0;
  let candidates = 0;
  for (;;) {
    let query = db.collection("reports").orderBy("__name__").limit(200);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    if (snapshot.empty) break;
    const batch = db.batch();
    let edits = 0;
    for (const doc of snapshot.docs) {
      scanned++;
      const data = doc.data();
      if (data.geohash || !isValidCoordinates(data.latitude, data.longitude)) continue;
      candidates++;
      batch.update(doc.ref, {
        geohash: geohashForLocation([Number(data.latitude), Number(data.longitude)]),
      });
      edits++;
    }
    if (apply && edits) await batch.commit();
    cursor = snapshot.docs.at(-1);
  }
  console.log((apply ? "Updated " : "Would update ") + candidates +
    " of " + scanned + " reports with missing geohashes.");
  if (!apply) console.log("No changes made. Pass --apply when ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
