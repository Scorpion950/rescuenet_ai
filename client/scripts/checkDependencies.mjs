// Runs before Vite so a stale node_modules produces a useful error message.
// No automatic installs or network access.
const dependencies = [
  "react",
  "react-dom",
  "react-router-dom",
  "vite",
  "lucide-react",
  "@auth0/auth0-react",
  "firebase/app",
  "firebase/firestore",
  "firebase/auth",
  "leaflet",
  "react-leaflet",
  "react-leaflet-cluster",
  "react-hot-toast",
  "@vitejs/plugin-react",
  "@tailwindcss/vite",
];

const missing = [];
for (const name of dependencies) {
  try {
    import.meta.resolve(name);
  } catch {
    missing.push(name);
  }
}

if (missing.length) {
  console.error("\nRescueNet frontend dependencies are missing: " + missing.join(", "));
  console.error("The project's previous node_modules may be out of date.");
  console.error("Stop the dev server, open a terminal in the client folder, then run:");
  console.error("  npm ci");
  console.error("  npm run dev\n");
  process.exit(1);
}
