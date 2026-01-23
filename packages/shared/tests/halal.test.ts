import { describe, expect, it } from "vitest"
import { classifyHalal } from "../src/halal"

describe("classifyHalal", () => {
  it("returns haram for explicit haram ingredients", () => {
    const result = classifyHalal(["Pork Flavor", "Salt"])
    expect(result.status).toBe("haram")
  })

  it("returns unclear for ambiguous ingredients", () => {
    const result = classifyHalal(["Gelatin", "Sugar"])
    expect(result.status).toBe("unclear")
  })

  it("returns halal when halal text is detected", () => {
    const result = classifyHalal(["Water"], "Halal certified")
    expect(result.status).toBe("halal")
  })
})
