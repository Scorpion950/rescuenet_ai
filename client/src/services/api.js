import { auth } from "../firebase";
import { API_BASE_URL } from "../utils/constants";

export async function apiFetch(path, { method = "GET", body, headers = {}, ...options } = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Sign in to continue.");
  const response = await fetch(API_BASE_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...options,
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ").");
  return data;
}

export async function publicApi(path, body) {
  const response = await fetch(API_BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
