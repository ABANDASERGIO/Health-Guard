const MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookies(role: "patient" | "doctor" | "admin") {
  if (typeof document === "undefined") return;
  document.cookie = `hg_session=1; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  document.cookie = `hg_role=${role}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "hg_session=; path=/; max-age=0";
  document.cookie = "hg_role=; path=/; max-age=0";
}
