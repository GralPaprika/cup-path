export function readUiPreference<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeUiPreference<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function readInitialUiPreference<T>(key: string, defaultValue: T): T {
  return readUiPreference<T>(key) ?? defaultValue;
}
