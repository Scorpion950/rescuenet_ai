import { apiFetch } from "./api";

export async function sendVerificationVote(reportId, voteType) {
  try {
    return await apiFetch("/verify-incident", {
      method: "POST", body: { reportId, voteType },
    });
  } catch (error) {
    return { error: error.message };
  }
}
