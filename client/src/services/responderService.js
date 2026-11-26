import { apiFetch } from "./api";

export const getResponderIncidents = (type) =>
  apiFetch("/responder-incidents/" + encodeURIComponent(type));

export const deployIncident = (id, source) =>
  apiFetch("/deploy-incident/" + encodeURIComponent(id), {
    method: "PUT", body: { source },
  });

export const resolveIncident = (id, source) =>
  apiFetch("/resolve-incident/" + encodeURIComponent(id), {
    method: "PUT", body: { source },
  });
