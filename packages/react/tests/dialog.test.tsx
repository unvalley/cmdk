import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { CommandDialog } from "../src/dialog"
import { CommandInput } from "../src/input"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { dispatchKeyDown, render } from "./helpers"

describe("<CommandDialog>", () => {
  it("does not render dialog content visibly when open=false", async () => {
    await render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    const dialog = document.querySelector("dialog")
    expect(dialog).not.toBeNull()
    expect(dialog?.open).toBe(false)
  })

  it("opens the dialog when open=true", async () => {
    await render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    const dialog = document.querySelector("dialog")
    expect(dialog?.open).toBe(true)
  })

  it("toggles open state when prop changes", async () => {
    const screen = await render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(false)

    await screen.rerender(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(true)

    await screen.rerender(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(false)
  })

  it("fires onOpenChange(false) when the native close event is dispatched (ESC key)", async () => {
    const onOpenChange = vi.fn()

    await render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    const dialog = document.querySelector("dialog")
    if (!dialog) throw new Error("dialog not found")

    dialog.dispatchEvent(new Event("close"))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("closes when Escape is pressed from the input (Safari-safe path)", async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{Escape}")

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("clears the search input when the dialog closes", async () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            open
          </button>
          <CommandDialog label="menu" onOpenChange={setOpen} open={open}>
            <CommandInput placeholder="Search" />
          </CommandDialog>
        </>
      )
    }

    const screen = await render(<Wrapper />)
    const input = screen.getByPlaceholder("Search")

    await input.fill("hello")
    await expect.element(input).toHaveValue("hello")

    await input.click()
    await userEvent.keyboard("{Escape}")
    await screen.getByText("open").click()

    await expect.element(screen.getByPlaceholder("Search")).toHaveValue("")
  })

  it("honors defaultSearch for uncontrolled dialogs", async () => {
    const screen = await render(
      <CommandDialog defaultSearch="hello" label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    await expect.element(screen.getByPlaceholder("Search")).toHaveValue("hello")
  })

  it("restores defaultSearch when an uncontrolled dialog closes", async () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            open
          </button>
          <CommandDialog defaultSearch="hello" label="menu" onOpenChange={setOpen} open={open}>
            <CommandInput placeholder="Search" />
          </CommandDialog>
        </>
      )
    }

    const screen = await render(<Wrapper />)
    const input = screen.getByPlaceholder("Search")

    await expect.element(input).toHaveValue("hello")
    await input.fill("world")
    await expect.element(input).toHaveValue("world")

    await input.click()
    await userEvent.keyboard("{Escape}")
    await screen.getByText("open").click()

    await expect.element(screen.getByPlaceholder("Search")).toHaveValue("hello")
  })

  it("does not clear search on close when search is controlled", async () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true)
      const [search, setSearch] = useState("hello")

      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            open
          </button>
          <CommandDialog
            label="menu"
            onOpenChange={setOpen}
            onSearchChange={setSearch}
            open={open}
            search={search}
          >
            <CommandInput placeholder="Search" />
          </CommandDialog>
        </>
      )
    }

    const screen = await render(<Wrapper />)
    const input = screen.getByPlaceholder("Search")

    await input.click()
    await userEvent.keyboard("{Escape}")
    await screen.getByText("open").click()

    await expect.element(screen.getByPlaceholder("Search")).toHaveValue("hello")
  })

  it("does not close on Escape during IME composition", async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const input = screen.getByPlaceholder("Search").element()

    dispatchKeyDown(input, { isComposing: true, key: "Escape" })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("contains the Command with the command-palette-root attribute", async () => {
    await render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    const dialog = document.querySelector("dialog")
    expect(dialog?.querySelector("[command-palette-root]")).not.toBeNull()
  })

  it("renders children as Command content (input is usable)", async () => {
    const onSearchChange = vi.fn()
    const screen = await render(
      <CommandDialog
        label="menu"
        onOpenChange={() => {}}
        onSearchChange={onSearchChange}
        open={true}
      >
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
        </CommandList>
      </CommandDialog>,
    )

    await screen.getByPlaceholder("Search").fill("a")

    expect(onSearchChange).toHaveBeenCalledWith("a")
  })

  it("closing via backdrop click (clicking the dialog element itself) fires onOpenChange(false)", async () => {
    const onOpenChange = vi.fn()

    await render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    const dialog = document.querySelector("dialog")
    if (!dialog) throw new Error("dialog not found")

    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("clicking inside the dialog does NOT close it", async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    await screen.getByPlaceholder("Search").click()

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
