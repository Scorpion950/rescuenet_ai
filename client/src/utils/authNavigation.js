const RETURN_TO_KEY = "rescuenet:auth:return-to";

export function safeDestination(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\r\n]/.test(value)) return null;
  try {
    const parsed = new URL(value, "https://rescuenet.invalid");
    if (parsed.origin !== "https://rescuenet.invalid") return null;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return null;
  }
}

export function rememberDestination(destination) {
  const safe = safeDestination(destination);
  if (safe) {
    try { sessionStorage.setItem(RETURN_TO_KEY, safe); } catch { /* storage may be disabled */ }
  }
  return safe || "/report";
}

export function consumeDestination(appState) {
  let stored = null;
  try {
    stored = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch { /* storage may be disabled */ }
  return safeDestination(appState?.returnTo) || safeDestination(stored) || "/report";
}
