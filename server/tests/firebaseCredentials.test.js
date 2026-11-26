const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { selectFirebaseCredentials, LEGACY_LOCAL_KEY } =
  require("../config/firebaseCredentials");

const absent = () => false;
const localOnly = (file) => file === LEGACY_LOCAL_KEY;

test("a legacy local key is automatically detected when no env credential exists", () => {
  const selected = selectFirebaseCredentials({}, localOnly);
  assert.deepEqual(selected, { kind: "file", file: LEGACY_LOCAL_KEY });
});

test("an explicit service-account path wins over a legacy local key", () => {
  const cwd = "/projects/rescuenet/server";
  const keyFile = path.resolve(cwd, "private/firebase-key.json");
  const selected = selectFirebaseCredentials({
    FIREBASE_SERVICE_ACCOUNT_PATH: "private/firebase-key.json",
  }, (file) => file === keyFile || file === LEGACY_LOCAL_KEY, cwd);
  assert.deepEqual(selected, { kind: "file", file: keyFile });
});

test("missing explicit credential file does not silently fall back to another identity", () => {
  assert.throws(() => selectFirebaseCredentials({
    GOOGLE_APPLICATION_CREDENTIALS: "/bad/missing-file.json",
  }, localOnly), /missing file/i);
});

test("inline service-account JSON takes precedence and is validated", () => {
  const data = {
    project_id: "demo-test", client_email: "example@example.com",
    private_key: "dummy-private-key",
  };
  assert.deepEqual(selectFirebaseCredentials({
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify(data),
  }, localOnly), { kind: "inline", data });
  assert.throws(() => selectFirebaseCredentials({
    FIREBASE_SERVICE_ACCOUNT: "{bad-json",
  }, absent), /not valid JSON/);
});

test("local emulator mode requires both services and cannot run as production", () => {
  const env = {
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  };
  assert.deepEqual(selectFirebaseCredentials(env, absent), { kind: "emulator" });
  assert.throws(() => selectFirebaseCredentials({
    FIRESTORE_EMULATOR_HOST: env.FIRESTORE_EMULATOR_HOST,
  }, absent), /BOTH/);
  assert.throws(() => selectFirebaseCredentials({
    ...env, NODE_ENV: "production", GOOGLE_CLOUD_PROJECT: "demo",
  }, absent), /must not/);
});

test("managed deployment uses ADC, while an unconfigured local server fails clearly", () => {
  assert.deepEqual(selectFirebaseCredentials({ K_SERVICE: "rescuenet" }, absent),
    { kind: "adc" });
  assert.throws(() => selectFirebaseCredentials({}, absent),
    /serviceAccountKey.json/);
});
