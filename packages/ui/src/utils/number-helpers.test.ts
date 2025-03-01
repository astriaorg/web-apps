import {
  FORMAT_ABBREVIATED_NUMBER_SUFFIX,
  formatAbbreviatedNumber,
  formatNumber,
  formatNumberAsPercent,
  formatDecimalValues,
  isDustAmount,
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

  it("should format with minimumFractionDigits", () => {
    const result = formatAbbreviatedNumber("1500000", {
      minimumFractionDigits: 3,
    });
    expect(result).toEqual({
      value: "1.500",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.MILLION,
    });
  });

  it("should show full thousand value when showFullThousandValue is true", () => {
    const result = formatAbbreviatedNumber("7500", {
      showFullThousandValue: true,
    });
    expect(result).toEqual({
      value: "7500",
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.THOUSAND,
    });
  });
});

describe("formatNumber", () => {
  it("should format numbers with default decimal places", () => {
    expect(formatNumber(1234.5678)).toBe("1,234.5678");
  });

  it("should format string numbers properly", () => {
    expect(formatNumber("1234.5678")).toBe("1,234.5678");
  });

  it("should format with custom decimal places", () => {
    expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
  });

  it("should remove commas from string input", () => {
    expect(formatNumber("1,234.5678")).toBe("1,234.5678");
  });

  it("should handle negative numbers", () => {
    expect(formatNumber(-1234.5678, 2)).toBe("-1,234.57");
  });

  it("should handle zero", () => {
    expect(formatNumber(0, 2)).toBe("0.00");
  });
});

describe("formatNumberAsPercent", () => {
  it("should format numbers as percentage with default 2 decimal places", () => {
    expect(formatNumberAsPercent(12.3456)).toBe("12.35%");
  });

  it("should format with custom decimal places", () => {
    expect(formatNumberAsPercent(12.3456, 3)).toBe("12.346%");
  });

  it("should handle string input", () => {
    expect(formatNumberAsPercent("12.3456")).toBe("12.35%");
  });

  it("should handle negative percentages", () => {
    expect(formatNumberAsPercent(-12.3456)).toBe("-12.35%");
  });

  it("should handle zero", () => {
    expect(formatNumberAsPercent(0)).toBe("0.00%");
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
