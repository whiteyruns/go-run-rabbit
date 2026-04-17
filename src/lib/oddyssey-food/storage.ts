import type { DashboardState } from "./types";

const KEY = "oddyssey-food-dashboard-v1";

export function saveState(state: DashboardState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save dashboard state:", e);
  }
}

export function loadState(): DashboardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardState;
  } catch (e) {
    console.error("Failed to load dashboard state:", e);
    return null;
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
