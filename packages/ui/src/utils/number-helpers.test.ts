import {
  FORMAT_ABBREVIATED_NUMBER_SUFFIX,
  formatAbbreviatedNumber,
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
});
