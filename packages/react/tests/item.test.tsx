import { describe, expect, it, vi } from "vitest"
import { Command } from "../src/command"
import { CommandItem } from "../src/item"
import { render } from "./helpers"

describe("<Command.Item>", () => {
  it("renders with command-palette-item attribute", async () => {
    const screen = await render(
      <Command>
        <CommandItem value="apple">Apple</CommandItem>
      </Command>,
    )

    await expect.element(screen.getByText("Apple")).toHaveAttribute("command-palette-item", "")
  })

  it("fires onSelect when clicked", async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <Command>
        <CommandItem onSelect={onSelect} value="apple">
          Apple
        </CommandItem>
      </Command>,
    )

    await screen.getByText("Apple").click()

    expect(onSelect).toHaveBeenCalledWith("apple", expect.any(Object))
  })

  it("passes the click event to onSelect (#156)", async () => {
    const onSelect = vi.fn()
    const screen = await render(
      <Command>
        <CommandItem onSelect={onSelect} value="apple">
          Apple
        </CommandItem>
      </Command>,
    )

    await screen.getByText("Apple").click()

    expect(onSelect.mock.calls[0]?.[1]).toBeInstanceOf(Event)
  })

  it("sets data-selected on the highlighted item", async () => {
    const screen = await render(
      <Command value="apple">
        <CommandItem value="apple">Apple</CommandItem>
        <CommandItem value="banana">Banana</CommandItem>
      </Command>,
    )

    await expect.element(screen.getByText("Apple")).toHaveAttribute("data-selected", "true")
    await expect.element(screen.getByText("Banana")).not.toHaveAttribute("data-selected")
  })

  it("sets data-disabled on disabled items", async () => {
    const screen = await render(
      <Command>
        <CommandItem disabled value="apple">
          Apple
        </CommandItem>
      </Command>,
    )

    await expect.element(screen.getByText("Apple")).toHaveAttribute("data-disabled", "true")
  })

  it("hides item when filtered out", async () => {
    const screen = await render(
      <Command search="xyz">
        <CommandItem value="apple">Apple</CommandItem>
      </Command>,
    )

    await expect.element(screen.getByText("Apple")).not.toBeInTheDocument()
  })

  it("renders item with empty-string value (#357)", async () => {
    const screen = await render(
      <Command>
        <CommandItem value="">All</CommandItem>
      </Command>,
    )

    await expect.element(screen.getByText("All")).toHaveAttribute("command-palette-item", "")
  })

  it("renders item with special chars in value without crashing (#387)", async () => {
    await expect(
      render(
        <Command>
          <CommandItem value="<script>alert(1)</script>">XSS</CommandItem>
        </Command>,
      ),
    ).resolves.toBeDefined()
  })

  it("selectOnHover updates value on pointer move by default", async () => {
    const screen = await render(
      <Command>
        <CommandItem value="a">A</CommandItem>
        <CommandItem value="b">B</CommandItem>
      </Command>,
    )

    await screen.getByText("B").hover()

    await expect.element(screen.getByText("B")).toHaveAttribute("data-selected", "true")
  })

  it("selectOnHover={false} does not update value on pointer move (#49)", async () => {
    const screen = await render(
      <Command selectOnHover={false}>
        <CommandItem value="a">A</CommandItem>
        <CommandItem value="b">B</CommandItem>
      </Command>,
    )

    await screen.getByText("B").hover()

    await expect.element(screen.getByText("B")).not.toHaveAttribute("data-selected")
  })

  it("updates selectOnHover after rerender", async () => {
    const screen = await render(
      <Command selectOnHover={false}>
        <CommandItem value="a">A</CommandItem>
        <CommandItem value="b">B</CommandItem>
      </Command>,
    )

    await screen.getByText("B").hover()
    await expect.element(screen.getByText("B")).not.toHaveAttribute("data-selected")

    await screen.rerender(
      <Command selectOnHover>
        <CommandItem value="a">A</CommandItem>
        <CommandItem value="b">B</CommandItem>
      </Command>,
    )

    await screen.getByText("B").hover()
    await expect.element(screen.getByText("B")).toHaveAttribute("data-selected", "true")
  })
})
