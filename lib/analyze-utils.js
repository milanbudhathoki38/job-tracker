export const MAX_JD_LENGTH = 6000;
export const RATE_LIMIT = 10;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

export function isRateLimited(count, limit = RATE_LIMIT) {
  return count >= limit;
}

export function isValidJobDescription(jobDescription) {
  return Boolean(jobDescription && jobDescription.trim());
}

export function truncateJobDescription(jobDescription, maxLength = MAX_JD_LENGTH) {
  return jobDescription.slice(0, maxLength);
}

export function parseAnalysisResponse(raw) {
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, "").trim();
  return JSON.parse(cleaned); // throws if invalid — caller should catch
}