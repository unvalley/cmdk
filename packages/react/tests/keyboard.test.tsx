import { describe, expect, it, vi } from "vitest"
import { type RenderResult, userEvent } from "vitest/browser"
import { Command } from "../src/command"
import { CommandInput } from "../src/input"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { render } from "./helpers"

function setup(props?: Parameters<typeof Command>[0]): Promise<RenderResult> {
  return render(
    <Command {...props}>
      <CommandInput placeholder="Search" />
      <CommandList>
        <CommandItem value="a">A</CommandItem>
        <CommandItem value="b">B</CommandItem>
        <CommandItem value="c">C</CommandItem>
      </CommandList>
    </Command>,
  )
}

function selected(): string | null {
  return document.querySelector('[data-selected="true"]')?.textContent ?? null
}

describe("keyboard navigation", () => {
  it("ArrowDown moves selection forward", async () => {
    const screen = await setup()
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{ArrowDown}")
    expect(selected()).toBe("A")

    await userEvent.keyboard("{ArrowDown}")
    expect(selected()).toBe("B")
  })

  it("ArrowUp moves selection backward", async () => {
    const screen = await setup()
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}")

    expect(selected()).toBe("A")
  })

  it("Home selects first", async () => {
    const screen = await setup()
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Home}")

    expect(selected()).toBe("A")
  })

  it("End selects last", async () => {
    const screen = await setup()
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{End}")

    expect(selected()).toBe("C")
  })

  it("Enter triggers onSelect for current item", async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem onSelect={onSelect} value="a">
            A
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{ArrowDown}{Enter}")

    expect(onSelect).toHaveBeenCalledWith("a", expect.any(Object))
  })

  it("loop wraps ArrowDown past end", async () => {
    const screen = await setup({ loop: true })
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{End}{ArrowDown}")

    expect(selected()).toBe("A")
  })

  it("updates loop behavior after rerender", async () => {
    const screen = await setup({ loop: false })
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{End}{ArrowDown}")
    expect(selected()).toBe("C")

    await screen.rerender(
      <Command loop>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="a">A</CommandItem>
          <CommandItem value="b">B</CommandItem>
          <CommandItem value="c">C</CommandItem>
        </CommandList>
      </Command>,
    )

    await input.click()
    await userEvent.keyboard("{ArrowDown}")

    expect(selected()).toBe("A")
  })
})
