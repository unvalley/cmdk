import { act, fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { CommandDialog } from "../src/dialog"
import { CommandInput } from "../src/input"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"

describe("<CommandDialog>", () => {
  it("does not render dialog content visibly when open=false", () => {
    render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const dialog = document.querySelector("dialog")
    expect(dialog).toBeInTheDocument()
    expect(dialog?.open).toBe(false)
  })

  it("opens the dialog when open=true", () => {
    render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const dialog = document.querySelector("dialog")
    expect(dialog?.open).toBe(true)
  })

  it("toggles open state when prop changes", () => {
    const { rerender } = render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(false)

    rerender(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(true)

    rerender(
      <CommandDialog label="menu" onOpenChange={() => {}} open={false}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    expect(document.querySelector("dialog")?.open).toBe(false)
  })

  it("fires onOpenChange(false) when the native close event is dispatched (ESC key)", () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const dialog = document.querySelector("dialog")
    if (!dialog) throw new Error("dialog not found")
    // Simulate the user pressing ESC — the native dialog fires a `close` event
    // and sets open=false. We simulate by calling close() directly.
    fireEvent(dialog, new Event("close"))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("closes when Escape is pressed from the input (Safari-safe path)", () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const input = screen.getByPlaceholderText("Search")
    fireEvent.keyDown(input, { key: "Escape" })
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
    render(<Wrapper />)
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement
    fireEvent.change(input, { target: { value: "hello" } })
    expect(input.value).toBe("hello")
    // Close with Escape
    fireEvent.keyDown(input, { key: "Escape" })
    await act(async () => {})
    // Reopen — the input should be cleared
    fireEvent.click(screen.getByText("open"))
    await act(async () => {})
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("")
  })

  it("honors defaultSearch for uncontrolled dialogs", () => {
    render(
      <CommandDialog defaultSearch="hello" label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    expect(screen.getByPlaceholderText("Search")).toHaveValue("hello")
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

    render(<Wrapper />)
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement
    expect(input.value).toBe("hello")
    fireEvent.change(input, { target: { value: "world" } })
    expect(input.value).toBe("world")
    fireEvent.keyDown(input, { key: "Escape" })
    await act(async () => {})
    fireEvent.click(screen.getByText("open"))
    await act(async () => {})
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("hello")
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
    render(<Wrapper />)
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement
    fireEvent.keyDown(input, { key: "Escape" })
    await act(async () => {})
    fireEvent.click(screen.getByText("open"))
    await act(async () => {})
    // Consumer kept "hello" in its state — library must not have touched it.
    expect((screen.getByPlaceholderText("Search") as HTMLInputElement).value).toBe("hello")
  })

  it("does not close on Escape during IME composition", () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const input = screen.getByPlaceholderText("Search")
    fireEvent.keyDown(input, { key: "Escape", isComposing: true })
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("contains the Command with the command-palette-root attribute", () => {
    render(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const dialog = document.querySelector("dialog")
    expect(dialog?.querySelector("[command-palette-root]")).toBeInTheDocument()
  })

  it("renders children as Command content (input is usable)", async () => {
    const onSearchChange = vi.fn()
    render(
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
    const input = screen.getByPlaceholderText("Search")
    fireEvent.change(input, { target: { value: "a" } })
    expect(onSearchChange).toHaveBeenCalledWith("a")
  })

  it("closing via backdrop click (clicking the dialog element itself) fires onOpenChange(false)", () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const dialog = document.querySelector("dialog")
    if (!dialog) throw new Error("dialog not found")
    // A click whose target is the dialog element itself (not a descendant)
    // represents a backdrop click — dispatch on the dialog element directly
    fireEvent.click(dialog, { target: dialog })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("clicking inside the dialog does NOT close it", () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog label="menu" onOpenChange={onOpenChange} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )
    const input = screen.getByPlaceholderText("Search")
    fireEvent.click(input)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
