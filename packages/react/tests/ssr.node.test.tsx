import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Command } from "../src/command"
import { CommandDialog } from "../src/dialog"
import { CommandEmpty } from "../src/empty"
import { CommandInput } from "../src/input"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"

describe("SSR rendering", () => {
  it("renders the command root without throwing during server prerender", () => {
    const html = renderToString(
      <Command label="menu">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem value="apple">Apple</CommandItem>
          <CommandItem value="banana">Banana</CommandItem>
        </CommandList>
      </Command>,
    )

    expect(html).toContain('command-palette-root=""')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('role="listbox"')
  })

  it("renders an explicit empty state when no items are present", () => {
    const html = renderToString(
      <Command label="menu">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
        </CommandList>
      </Command>,
    )

    expect(html).toContain("No results")
  })

  it("renders the dialog shell during server prerender", () => {
    const html = renderToString(
      <CommandDialog label="menu" onOpenChange={() => {}} open={true}>
        <CommandInput placeholder="Search" />
      </CommandDialog>,
    )

    expect(html).toContain("<dialog")
    expect(html).toContain('command-palette-dialog=""')
  })
})
