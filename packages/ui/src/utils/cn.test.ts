import { cn } from "./cn";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const condition = true;
    const result = cn("base", condition && "conditional", !condition && "not-applied");
    expect(result).toBe("base conditional");
  });

  it("should handle falsy values", () => {
    expect(cn("base", false, null, undefined, 0, "valid")).toBe("base valid");
  });

  it("should handle arrays of classes", () => {
    expect(cn("base", ["array1", "array2"])).toBe("base array1 array2");
  });

  it("should merge Tailwind classes correctly", () => {
    // twMerge should resolve conflicts with the last class winning
    const result = cn("p-4", "p-8", "m-2", "m-4");
    // The order might vary between twMerge versions, so test for content rather than exact string
    expect(result).toContain("p-8");
    expect(result).toContain("m-4");
    expect(result).not.toContain("p-4");
    expect(result).not.toContain("m-2");
  });

  it("should handle complex Tailwind conflicts", () => {
    const result = cn(
      "text-red-500 p-2 rounded-lg",
      "text-blue-500 p-4",
      "hover:text-green-500"
    );
    // Check for presence of correctly merged classes rather than exact order
    expect(result).toContain("rounded-lg");
    expect(result).toContain("p-4");
    expect(result).toContain("text-blue-500");
    expect(result).toContain("hover:text-green-500");
    expect(result).not.toContain("text-red-500");
    expect(result).not.toContain("p-2");
  });
});