import { describe, expect, it } from "vitest"
import { normalize } from "../src/normalize"

describe("normalize", () => {
  it("lowercases", () => {
    expect(normalize("ABC")).toBe("abc")
  })

  it("removes diacritics (NFD)", () => {
    expect(normalize("café")).toBe("cafe")
    expect(normalize("naïve")).toBe("naive")
    expect(normalize("Ångström")).toBe("angstrom")
  })

  it("normalizes whitespace variants to space", () => {
    expect(normalize("foo\tbar")).toBe("foo bar")
    expect(normalize("foo-bar")).toBe("foo bar")
    expect(normalize("foo_bar")).toBe("foo bar")
    expect(normalize("foo\nbar")).toBe("foo bar")
  })

  it("handles empty string", () => {
    expect(normalize("")).toBe("")
  })

  it("handles strings already normalized", () => {
    expect(normalize("hello world")).toBe("hello world")
  })
})
