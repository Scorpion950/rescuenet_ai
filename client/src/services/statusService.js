import { apiFetch } from "./api";

export const updateIncidentStatus = (incidentId, status, source = "report") =>
  apiFetch("/incident/status", { method: "POST", body: { incidentId, status, source } });
