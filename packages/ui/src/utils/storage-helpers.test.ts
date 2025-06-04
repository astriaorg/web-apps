import {
  getFromLocalStorage,
  getSlippageTolerance,
  setInLocalStorage,
} from "./storage-helpers";

describe("storage-helpers", () => {
  // Save the original localStorage
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    // Mock localStorage before each test
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage after each test
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe("getFromLocalStorage", () => {
    it("should return parsed JSON from localStorage", () => {
      const testData = { test: "value" };
      window.localStorage.getItem = jest.fn(() => JSON.stringify(testData));

      const result = getFromLocalStorage("testKey");

      expect(window.localStorage.getItem).toHaveBeenCalledWith("testKey");
      expect(result).toEqual(testData);
    });

    it("should return empty object if item is not in localStorage", () => {
      window.localStorage.getItem = jest.fn(() => null);

      const result = getFromLocalStorage("nonExistentKey");

      expect(window.localStorage.getItem).toHaveBeenCalledWith(
        "nonExistentKey",
      );
      expect(result).toEqual({});
    });

    it("should handle invalid JSON by returning empty object", () => {
      console.error = jest.fn(); // Suppress error logs from JSON.parse
      window.localStorage.getItem = jest.fn(() => "invalid-json");

      const result = getFromLocalStorage("testKey");

      expect(window.localStorage.getItem).toHaveBeenCalledWith("testKey");
      expect(result).toEqual({});
    });
  });

  describe("setInLocalStorage", () => {
    it("should store stringified JSON in localStorage", () => {
      const testData = { test: "value" };

      setInLocalStorage("testKey", testData);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify(testData),
      );
    });

    it("should store primitive values properly", () => {
      setInLocalStorage("numberKey", 123);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "numberKey",
        "123",
      );

      setInLocalStorage("stringKey", "test");
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "stringKey",
        '"test"',
      );

      setInLocalStorage("booleanKey", true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "booleanKey",
        "true",
      );
    });
  });

  describe("getSlippageTolerance", () => {
    it("should return slippageTolerance from settings", () => {
      const settings = { slippageTolerance: 0.5 };
      window.localStorage.getItem = jest.fn(() => JSON.stringify(settings));

      const result = getSlippageTolerance();

      expect(window.localStorage.getItem).toHaveBeenCalledWith("settings");
      expect(result).toBe(0.5);
    });

    it("should return undefined if settings don't exist", () => {
      window.localStorage.getItem = jest.fn(() => null);

      const result = getSlippageTolerance();

      expect(window.localStorage.getItem).toHaveBeenCalledWith("settings");
      expect(result).toBeUndefined();
    });

    it("should return undefined if slippageTolerance is not in settings", () => {
      const settings = { otherSetting: "value" };
      window.localStorage.getItem = jest.fn(() => JSON.stringify(settings));

      const result = getSlippageTolerance();

      expect(window.localStorage.getItem).toHaveBeenCalledWith("settings");
      expect(result).toBeUndefined();
    });
  });
});
