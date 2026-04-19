import { useEffect, useState } from "react"
import { describe, expect, it } from "vitest"
import { Command } from "../src/command"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { render } from "./helpers"

describe("async items (regressions)", () => {
  it("async items render correctly when added after mount (#280)", async () => {
    function Demo() {
      const [items, setItems] = useState<string[]>([])

      useEffect(() => {
        Promise.resolve().then(() => setItems(["x", "y", "z"]))
      }, [])

      return (
        <Command>
          <CommandList>
            {items.map((v) => (
              <CommandItem key={v} value={v}>
                {v}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )
    }

    const screen = await render(<Demo />)

    await expect.element(screen.getByText("x")).toBeInTheDocument()
    await expect.element(screen.getByText("y")).toBeInTheDocument()
    await expect.element(screen.getByText("z")).toBeInTheDocument()
  })

  it("selection updates when items are replaced (#267)", async () => {
    function Demo({ items }: { items: string[] }) {
      return (
        <Command>
          <CommandList>
            {items.map((v) => (
              <CommandItem key={v} value={v}>
                {v}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      )
    }

    const screen = await render(<Demo items={["a", "b"]} />)

    await screen.rerender(<Demo items={["x", "y"]} />)

    await expect.element(screen.getByText("x")).toBeInTheDocument()
    await expect.element(screen.getByText("a")).not.toBeInTheDocument()
  })
})
