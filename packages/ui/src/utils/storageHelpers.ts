export function getFromLocalStorage(item: string) {
  if (typeof window !== "undefined") {
    const retrievedItem = window.localStorage.getItem(item);
    if (retrievedItem) {
      return JSON.parse(retrievedItem);
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
