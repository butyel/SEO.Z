import { describe, it, expect } from "vitest"
import { cn, formatDate, pluralize } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })
})

describe("pluralize", () => {
  it("returns singular for count 1", () => {
    expect(pluralize(1, "empresa", "empresas")).toBe("empresa")
  })

  it("returns plural for count 0", () => {
    expect(pluralize(0, "empresa", "empresas")).toBe("empresas")
  })

  it("returns plural for count > 1", () => {
    expect(pluralize(5, "empresa", "empresas")).toBe("empresas")
  })
})

describe("formatDate", () => {
  it("formats date in short format", () => {
    const date = new Date("2026-07-22T12:00:00")
    const result = formatDate(date, "short")
    expect(result).toContain("22")
    expect(result).toContain("07")
    expect(result).toContain("2026")
  })
})
