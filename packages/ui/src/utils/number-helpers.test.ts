import {
  FORMAT_ABBREVIATED_NUMBER_SUFFIX,
  formatAbbreviatedNumber,
  formatDecimalValues,
  isDustAmount,
  removeNonNumeric,
} from "./number-helpers";

describe("formatAbbreviatedNumber", () => {
  it("should format numbers in billions", () => {
    const result = formatAbbreviatedNumber("1500000000");
    expect(result).toEqual({
      value: "1.5",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.BILLION,
    });
  });

  it("should format numbers in millions", () => {
    const result = formatAbbreviatedNumber("2500000");
    expect(result).toEqual({
      value: "2.5",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.MILLION,
    });
  });

  it("should format numbers in thousands", () => {
    const result = formatAbbreviatedNumber("7500");
    expect(result).toEqual({
      value: "7.5",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.THOUSAND,
    });
  });

  it("should not format numbers less than a thousand", () => {
    const result = formatAbbreviatedNumber("500");
    expect(result).toEqual({
      value: "500",
      suffix: "",
    });
  });

  it("should handle negative numbers", () => {
    const result = formatAbbreviatedNumber("-1500000");
    expect(result).toEqual({
      value: "-1.5",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.MILLION,
    });
  });

  it("should not change numbers below the threshold", () => {
    const result = formatAbbreviatedNumber("7500", {
      threshold: "million",
    });
    expect(result).toEqual({
      value: "7500",
      suffix: "",
    });
  });
});

describe("isDustAmount", () => {
  it("should identify dust amounts below default threshold", () => {
    expect(isDustAmount(1e-11)).toBe(true);
  });

  it("should identify non-dust amounts above default threshold", () => {
    expect(isDustAmount(1e-9)).toBe(false);
  });

  it("should handle custom threshold", () => {
    expect(isDustAmount(0.01, 0.1)).toBe(true);
    expect(isDustAmount(0.5, 0.1)).toBe(false);
  });

  it("should handle string inputs", () => {
    expect(isDustAmount("0.0000000000001")).toBe(true); // Very small number
    expect(isDustAmount("0.001")).toBe(false); // Larger than threshold
  });

  it("should handle negative values", () => {
    expect(isDustAmount(-1e-11)).toBe(true);
    expect(isDustAmount(-1e-9)).toBe(false);
  });

  it("should handle zero", () => {
    expect(isDustAmount(0)).toBe(true);
  });
});

describe("formatDecimalValues", () => {
  it("should format with default 4 decimal places", () => {
    expect(formatDecimalValues("123.456789")).toBe("123.4568");
  });

  it("should format with custom decimal places", () => {
    expect(formatDecimalValues("123.456789", 2)).toBe("123.46");
  });

  it("should return '0' for undefined values", () => {
    expect(formatDecimalValues(undefined)).toBe("0");
  });

  it("should return '0' for empty string", () => {
    expect(formatDecimalValues("")).toBe("0");
  });

  it("should handle integers", () => {
    expect(formatDecimalValues("123")).toBe("123.0000");
  });
});

describe("removeNonNumeric", () => {
  it("should remove all non-numeric characters except decimal points", () => {
    expect(removeNonNumeric("123.456 TIA")).toBe("123.456");
  });

  it("should handle multiple decimal points", () => {
    expect(removeNonNumeric("123.456.789")).toBe("123.456.789");
  });

  it("should handle strings with special characters", () => {
    expect(removeNonNumeric("$1,234.56%")).toBe("1234.56");
  });

  it("should handle strings with letters", () => {
    expect(removeNonNumeric("abc123.45def")).toBe("123.45");
  });

  it("should return empty string for non-numeric input", () => {
    expect(removeNonNumeric("abc")).toBe("");
  });
});
