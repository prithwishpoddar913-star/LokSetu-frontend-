export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "stampSafar.theme";
export const THEME_CHANGED_EVENT = "stampSafar:theme-changed";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // fallback
  }
  return "system";
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    return getSystemTheme();
  }
  return pref;
}

export function applyTheme(pref: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(pref);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;
  }
  return resolved;
}

export function saveThemePreference(pref: ThemePreference): ResolvedTheme {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, pref);
    }
  } catch (err) {
    console.error("Failed to save theme preference:", err);
  }
  const resolved = applyTheme(pref);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGED_EVENT, { detail: { preference: pref, resolved } }),
    );
  }
  return resolved;
}

// Backward compatibility with previous readTheme/saveTheme
export function readTheme(): ResolvedTheme {
  return resolveTheme(readThemePreference());
}

export function saveTheme(theme: "light" | "dark") {
  saveThemePreference(theme);
}
