import { useRef } from "react"
import { describe, expect, it } from "vitest"
import { Command } from "../src/command"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { render } from "./helpers"

describe("regression: per-item render count", () => {
  it("hovering item B does not re-render item A (#377)", async () => {
    const renderCounts = { a: 0, b: 0 }

    function CountingItem({ value, label }: { value: string; label: "a" | "b" }) {
      const count = useRef(0)
      count.current++
      renderCounts[label] = count.current

      return <CommandItem value={value}>{value}</CommandItem>
    }

    const screen = await render(
      <Command>
        <CommandList>
          <CountingItem label="a" value="a" />
          <CountingItem label="b" value="b" />
        </CommandList>
      </Command>,
    )

    const aBefore = renderCounts.a

    await screen.getByText("b").hover()

    expect(renderCounts.a).toBe(aBefore)
  })
})
