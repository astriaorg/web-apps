import { validate } from "./use-validate-asset-amount";

describe("validate", () => {
  it("should return invalid when value is empty", () => {
    const result = validate({
      value: "",
      asset: { symbol: "ETH", decimals: 18 },
    });
    expect(result.isValid).toBe(false);
  });

  it("should validate a valid number within range", () => {
    const result = validate({
      value: "10",
      asset: { symbol: "ETH", decimals: 18 },
      minimum: "1",
      maximum: "20",
    });
    expect(result.isValid).toBe(true);
    expect(result.number).toBe(true);
    expect(result.minimum).toBe(true);
    expect(result.maximum).toBe(true);
  });

  it("should return invalid for a number below the minimum", () => {
    const result = validate({
      value: "0.5",
      asset: { symbol: "ETH", decimals: 18 },
      minimum: "1",
    });
    expect(result.isValid).toBe(false);
    expect(result.minimum).toBe(false);
  });

  it("should return invalid for a number above the maximum", () => {
    const result = validate({
      value: "25",
      asset: { symbol: "ETH", decimals: 18 },
      maximum: "20",
    });
    expect(result.isValid).toBe(false);
    expect(result.maximum).toBe(false);
  });

  it("should validate a number with allowed decimals", () => {
    const result = validate({
      value: "10.123",
      asset: { symbol: "ETH", decimals: 18 },
      decimals: 3,
    });
    expect(result.isValid).toBe(true);
    expect(result.decimals).toBe(true);
  });

  it("should return invalid for a number with too many decimals", () => {
    const result = validate({
      value: "10.12345",
      asset: { symbol: "ETH", decimals: 18 },
      decimals: 3,
    });
    expect(result.isValid).toBe(false);
    expect(result.decimals).toBe(false);
  });

  it("should return invalid for zero when canBeZero is false", () => {
    const result = validate({
      value: "0",
      asset: { symbol: "ETH", decimals: 18 },
      canBeZero: false,
    });
    expect(result.isValid).toBe(false);
    expect(result.zero).toBe(false);
  });

  it("should validate zero when canBeZero is true", () => {
    const result = validate({
      value: "0",
      asset: { symbol: "ETH", decimals: 18 },
      canBeZero: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.zero).toBe(true);
  });

  it("should return invalid for a non-numeric value", () => {
    const result = validate({
      value: "abc",
      asset: { symbol: "ETH", decimals: 18 },
    });
    expect(result.isValid).toBe(false);
    expect(result.number).toBe(false);
  });
});
