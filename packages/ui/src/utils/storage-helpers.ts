export function getFromLocalStorage(item: string) {
  if (typeof window !== "undefined") {
    const retrievedItem = window.localStorage.getItem(item);
    if (retrievedItem) {
      try {
        return JSON.parse(retrievedItem);
      } catch (error) {
        // If JSON parsing fails, log the error and return empty object
        console.error("Failed to parse item from localStorage:", error);
        return {};
      }
    }
  }
  return {};
}

export function setInLocalStorage(key: string, item: unknown) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(item));
  }
}

export function getSwapSlippageTolerance() {
  const settings = getFromLocalStorage("settings");
  return settings?.slippageTolerance;
}
