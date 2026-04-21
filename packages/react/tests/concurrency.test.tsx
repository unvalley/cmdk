import { StrictMode, startTransition, useState } from "react"
import { describe, expect, it } from "vitest"
import { Command } from "../src/command"
import { CommandInput } from "../src/input"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { render } from "./helpers"

describe("React 19 integration", () => {
  it("keeps a stable item tree in StrictMode", async () => {
    const screen = await render(
      <StrictMode>
        <Command>
          <CommandList>
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
          </CommandList>
        </Command>
      </StrictMode>,
    )

    expect(screen.container.querySelectorAll("[command-palette-item]")).toHaveLength(2)
    await expect.element(screen.getByText("Apple")).toBeInTheDocument()
    await expect.element(screen.getByText("Banana")).toBeInTheDocument()
  })

  it("reconciles controlled search updates scheduled in a transition", async () => {
    const Wrapper = () => {
      const [search, setSearch] = useState("app")

      return (
        <>
          <button
            onClick={() => {
              startTransition(() => setSearch("ban"))
            }}
            type="button"
          >
            filter
          </button>
          <Command search={search}>
            <CommandInput placeholder="Search" />
            <CommandList>
              <CommandItem value="apple">Apple</CommandItem>
              <CommandItem value="banana">Banana</CommandItem>
            </CommandList>
          </Command>
        </>
      )
    }

    const screen = await render(<Wrapper />)

    await expect.element(screen.getByText("Apple")).toBeInTheDocument()
    await expect.element(screen.getByText("Banana")).not.toBeInTheDocument()

    await screen.getByText("filter").click()

    await expect.element(screen.getByText("Apple")).not.toBeInTheDocument()
    await expect.element(screen.getByText("Banana")).toBeInTheDocument()
  })
})
