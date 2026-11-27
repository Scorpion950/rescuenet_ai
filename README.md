# RescueNet AI — community incident awareness (rebuild)

RescueNet is a React + Express + Firebase demonstration of community reporting, interactive incident mapping, nearby alerts, and role-scoped response queues.

> **Not a functioning emergency-dispatch service.** The site does **not** call police, ambulance services, fire brigades, or hospitals. Suggested facilities come from map data and are **not** verified dispatch partners. For a real emergency, contact the official emergency number in your area. Do not use this demo as a substitute.

## What's included

| Area | Rebuilt behavior |
| --- | --- |
| Civilian reporting | Auth0 login bridged to Firebase Auth, GPS on request, Cloudinary photos and videos, validated server-side report creation |
| AI triage | Server-side Gemini classification when configured; honest `UNASSESSED / NEEDS_REVIEW` fallback otherwise |
| Live map | Firestore real-time updates, worldwide incidents, severity filters, clustered pins, illustrative radius overlays, media |
| Community verification | One vote per authenticated Firebase UID in a Firestore transaction; changing a vote correctly changes counters |
| SOS | Select requested departments, get location, save a uniquely keyed demo request, show up to three nearest facility suggestions per service |
| Nearest facilities | OpenStreetMap Overpass lookups within 25 km, Haversine ranking, 10-minute cache; labeled local sample fallback only within 50 km |
| Nearby warnings | Consent-based geohash search within 5 km; persistent in-app notifications and a retryable job queue |
| Entry warnings | When the opted-in website shares new coordinates, it checks active incidents nearby and creates a notification once per incident |
| Optional browser push | FCM token registration and web push; **delivery disabled** until the backend operator explicitly enables it |
| Roles | Individual Firebase Auth admin/responder accounts with server-verified custom claims; shared department passwords retired |
| Report lifecycle | Archived instead of permanently deleted; deployment and resolution require authorized account actions; no automatic 30-minute resolution |
| Frontend | Updated responsive civic-style design, accessible forms, route-based code splitting, mobile map and operations screens |

## Local development

Requires a maintained Node.js release (Node 22+ recommended), a Firebase project with **Authentication / Firestore**, an Auth0 tenant and custom API, and optionally Cloudinary and a Gemini API key.

1. Install packages:

   ```bash
   cd server && npm ci
   cd ../client && npm ci
   ```

2. Copy `server/.env.example` to `server/.env`, and `client/.env.example` to `client/.env`. Fill in the values for **your** projects. Never put a Firebase Admin service account in `client/.env` or the browser bundle.

3. **Firebase**:
   - Enable Email/Password sign-in for individual operations accounts.
   - Enable Cloud Firestore; configure Firebase Authentication authorized domains.
   - Deploy `firestore.rules` and `firestore.indexes.json` with the Firebase CLI: `firebase deploy --only firestore`. Review rules before deploying into an existing Firebase project.
   - **For local development:** place your private `serviceAccountKey.json` into `server/`. The backend now detects it automatically for compatibility with older versions. The file is ignored by Git and deliberately absent from this ZIP.
   - Alternatively set `FIREBASE_SERVICE_ACCOUNT_PATH` or `GOOGLE_APPLICATION_CREDENTIALS` to the key file path. For cloud deployment, prefer a server-only `FIREBASE_SERVICE_ACCOUNT` JSON secret or managed workload identity. Never commit the Admin key or expose it in `VITE_*` variables.
   - App credentials in `VITE_FIREBASE_*` are Firebase's public **web configuration**, not the Admin key.

4. **Auth0**:
   - Create an SPA application. Add `http://localhost:5173` as an allowed callback/logout/web origin, along with your eventual HTTPS frontend domain.
   - **Important for older RescueNet tenants:** the application shown as **Generic** in Auth0 is not the intended client type for this React SPA. Open the application settings, ensure its **Application Type** is **Single Page Application**, and use its Client ID in `VITE_AUTH0_CLIENT_ID` (not the separate administrator app). Do not use a Client Secret in Vite.
   - On the deployed Vercel frontend `https://rescuenet-ai.vercel.app`, set **Allowed Callback URLs**, **Allowed Logout URLs** and **Allowed Web Origins** to include `https://rescuenet-ai.vercel.app` (and add `http://localhost:5173` for local development). The redirect URI intentionally uses the origin; the client restores `/report` or `/sos` using verified relative paths after Auth0 completes.
   - Create a custom API with an audience (identifier) that matches both `AUTH0_AUDIENCE` on the server and `VITE_AUTH0_AUDIENCE` on the client. Access tokens are verified against Auth0's RS256 JWKS before Firebase custom tokens are minted.
   - Match `AUTH0_DOMAIN` and `VITE_AUTH0_DOMAIN`.
   - If the site still returns to the homepage displaying **Sign in**, check the inline authentication error banner, inspect the URL for `error=` and confirm the SPA application settings above. If the site displays **Log out** but `/report` shows a session error, inspect `/auth/firebase-token` in Network and the backend's `AUTH0_AUDIENCE` / Firebase Admin configuration. Never paste JWTs or Firebase credentials into support requests.
   - After authorization, civilian users sign into Firebase via the token-exchange endpoint. They must **opt in again** to any location alerts; old phone number collection does not imply permission.

5. **Operations accounts**: create distinct Firebase Email/Password users in the Firebase console, then grant role claims using the trusted server environment:

   ```bash
   cd server
   node scripts/setRole.js admin@example.com admin
   node scripts/setRole.js police@example.com responder Police
   node scripts/setRole.js med@example.com responder Ambulance
   node scripts/setRole.js fire@example.com responder "Fire Brigade"
   ```

   The actual department and role are verified in Firebase ID tokens, **not** accepted from localStorage, the client UI, or editable request headers. Users must sign out and in after claims change.

6. **Media (optional)**: create a Cloudinary unsigned upload preset with sensible upload limits and restrictions, configure `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` and the corresponding server-side `CLOUDINARY_CLOUD_NAME`. Supported images: JPEG/PNG/WebP, up to 8 MB. Videos: MP4/WebM/QuickTime, up to 35 MB. Up to five attachments per report. Reports without attachments require no Cloudinary setup.

7. Start each app in its own terminal:

   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```

   The frontend uses `http://localhost:5173`; the API defaults to `http://localhost:5000`. Backend `GET /health` exposes a non-secret demo status.

### Windows PowerShell: common startup fixes

If Vite says **`Failed to resolve import "lucide-react"`**, stop the frontend server with Ctrl+C and reinstall dependencies using the included lockfile:

```powershell
cd "E:\My Projects\RescueNet_Ai\client"
npm ci
npm run dev
```

`npm ci` installs every dependency defined in `client/package-lock.json`, including `lucide-react`. Existing `node_modules` folders copied from an older version are not compatible with the rebuild. The frontend now checks for missing packages before starting Vite and gives an installation hint.

If the backend says **Firebase Admin credentials are missing**, supply your own private Firebase service-account JSON. In the Firebase console, open **Project settings → Service accounts**, and generate a new key if needed. Store it locally as `server/serviceAccountKey.json`; it will be picked up automatically. You can instead point `GOOGLE_APPLICATION_CREDENTIALS` to a local file; Windows paths with spaces should be quoted in `server/.env`:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS="E:/My Projects/RescueNet_Ai/server/serviceAccountKey.json"
```

Never paste the private key into a chat, commit it to Git, or include it in a deployable ZIP. If the original key was previously distributed, revoke/rotate it. **Hosted deployments** should use server-side secrets or workload identity, not a committed JSON key.

For a fully isolated local test without production credentials, run both the Firestore and Firebase Authentication emulators and configure `FIRESTORE_EMULATOR_HOST` plus `FIREBASE_AUTH_EMULATOR_HOST`. Emulator mode is blocked when `NODE_ENV=production`.

## How nearby notifications work

1. A user signs in and explicitly turns on **Nearby alerts**, then shares their position. Only consenting users have coordinates/geohashes persisted.
2. A report is committed in one Firestore batch with its department queue records and a `notification_jobs` outbox entry. It becomes visible on the map immediately.
3. The one-minute background job processes the outbox and queries consenting, recently located users within a true **5 km radius**; each receives at most one in-app notice for that report.
4. When a browser session has location updates running, movement syncs coordinates (usually after ~100 m / 60 seconds) and checks for active reports at the new position. This covers **entering a circle while using the site**.
5. Optional FCM browser notifications can also be delivered for new reports to already-subscribed clients. Set `VITE_FIREBASE_VAPID_KEY` (Web Push key), use HTTPS in deployment (localhost is allowed for development), and set `ENABLE_PUSH_DELIVERY=true` on the server **only after consent and delivery testing**.

**Web limitation:** browsers do not provide dependable background GPS geofencing once a page is closed. Entry alerts need a running/active page and user location consent. For reliable closed-app entry detection, a native mobile app or dedicated background location integration is required. FCM push does **not** acquire background GPS.

**SMS:** The old Twilio mass-SMS flow was removed from this version. Mobile phone numbers are not required; browser and in-app alerts replace it in the demo. If SMS is reintroduced, it should be queued, explicitly opted into, rate-limited, and legally reviewed before delivery.

## Migration from older RescueNet data

- All new reports store a `geohash`. Old reports without one still show on the real-time map, but will not appear in efficient nearby lookups.
- From a trusted server machine run `node scripts/backfillGeohashes.js` for a **dry run**; run `node scripts/backfillGeohashes.js --apply` only after reviewing your backup and results.
- Historical statuses (`VERIFIED & LIVE`, `NOT SURE`) are still visible on the map. Newly created reports use the updated statuses.
- Legacy user profiles were keyed by the raw Auth0 ID; newly bridged Firebase accounts use a hash-prefixed UID. User preferences and locations are **not silently migrated**. Ask users to opt in afresh.
- Older `incident_distributions` records with lowercase department types may need a separate one-off administrative migration. New records are normalized. Keep backups before modifying production data.
- Old unsafely distributed service-account keys, Twilio tokens, and OAuth/API secrets found in the original ZIP were **not included** in this rebuild. **Rotate them** in the provider consoles before deploying.

## Tests

```bash
cd server && npm test
cd client && npm run lint
cd client && npm run build
```

The server tests cover canonical departments, GPS validity, Haversine calculations, OSM proximity sorting, unavailable-station fallback, credential source selection, and HTTP startup/auth checks. **Live** Auth0/Firebase/Cloudinary/Gemini/FCM integration tests are not part of this package and must be performed with your credentials and a staging environment before any real deployment.

## Deployment safety checklist

- Deploy backend only to a trusted server environment; never publish the Admin service account or `server/.env`.
- Configure matching Auth0 audience/domain and Firebase project credentials on both applications.
- Review exact CORS origins (`FRONTEND_URL`, comma-separated for multiple deployments), security headers, Firebase authorized domains, and HTTPS. Configure `TRUST_PROXY_HOPS` for your actual reverse-proxy topology (0 for local use).
- Deploy Firestore rules and indexes, then provision individual role-based users.
- Ensure **one scheduled job runner** is active or provide a distributed job scheduling strategy.
- Configure media upload limits, server rate limits, map service quotas, and incident/report moderation workflows.
- If external emergency integrations are ever introduced: establish written station partnerships, explicit recipient registration, delivery acknowledgements, escalation/fallback procedures, abuse monitoring, and legal review. **The current code does not perform real dispatch.**

### Project-local UI skill

The selected Anthropic `frontend-design` skill is included at `.agents/skills/frontend-design/SKILL.md` along with its license, and referenced by `AGENTS.md` so future coding assistants can use it without installing any global skill.
