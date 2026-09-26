const STATUSES = ["Applied", "OA", "Interview", "Offer", "Rejected"];

export function getDisplayName(user) {
  if (!user) return "";

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName) return fullName.split(" ")[0];

  const localPart = user.email?.split("@")[0] || "";
  const firstChunk = localPart.split(/[._-]/)[0].replace(/[0-9]+$/, "");
  return firstChunk ? firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1) : "there";
}

export function isStale(app) {
  if (app.status !== "Applied") return false;
  const daysSinceApplied = (Date.now() - new Date(app.created_at)) / (1000 * 60 * 60 * 24);
  return daysSinceApplied >= 21;
}

export { STATUSES };