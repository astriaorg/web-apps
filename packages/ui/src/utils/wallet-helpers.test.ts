import { shortenAddress } from "./wallet-helpers";

describe("wallet-helpers", () => {
  describe("shortenAddress", () => {
    it("should shorten a long address with default parameters", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(shortenAddress(address)).toBe("0x1234...5678");
    });

    it("should handle custom start and end lengths", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(shortenAddress(address, 4, 6)).toBe("0x12...345678");
    });

    it("should return empty string for falsy address", () => {
      expect(shortenAddress("")).toBe("");
      expect(shortenAddress("", 4, 4)).toBe("");
    });

    it("should handle short addresses correctly", () => {
      const shortAddress = "0x1234";
      // The implementation shortens addresses even if they're shorter than start + end
      expect(shortenAddress(shortAddress, 2, 2)).toBe("0x...34");
    });

    it("should use start=0 if provided", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(shortenAddress(address, 0, 4)).toBe("...5678");
    });

    it("should use end=0 if provided", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(shortenAddress(address, 6, 0)).toBe("0x1234...");
    });

    it("should handle zero for both start and end", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(shortenAddress(address, 0, 0)).toBe("...");
    });
  });
});
