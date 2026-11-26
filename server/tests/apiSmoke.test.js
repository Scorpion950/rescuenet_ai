const test = require("node:test");
const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");

test("API boots with a configured service account and rejects unauthenticated writes", async () => {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  // Ephemeral test-only key; no real Firebase operations or network providers.
  process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
    project_id: "demo-rescuenet",
    client_email: "testing@demo-rescuenet.iam.gserviceaccount.com",
    private_key: privateKey,
  });
  process.env.RUN_BACKGROUND_JOBS = "false";
  const app = require("../index");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const origin = "http://127.0.0.1:" + server.address().port;
    const health = await fetch(origin + "/health");
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {
      status: "ok", dispatchMode: "simulation", pushEnabled: false,
    });
    for (const url of ["/reports", "/send-sos", "/verify-incident"]) {
      const response = await fetch(origin + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      assert.equal(response.status, 401, url + " should reject anonymous writes");
    }
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve())
    );
  }
});
