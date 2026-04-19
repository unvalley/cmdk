import { describe, expect, it } from "vitest"
import { Command } from "../src/command"
import { CommandGroup } from "../src/group"
import { CommandItem } from "../src/item"
import { CommandList } from "../src/list"
import { render } from "./helpers"

describe("<CommandGroup> + <CommandItem>", () => {
  it("items inherit groupId from context so the group becomes visible", async () => {
    const { container } = await render(
      <Command>
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem value="home">Home</CommandItem>
            <CommandItem value="settings">Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    const group = container.querySelector("[command-palette-group]")
    expect(group).not.toBeNull()
    expect(group?.hasAttribute("hidden")).toBe(false)
  })

  it("hides group when none of its items match the search", async () => {
    const { container } = await render(
      <Command search="xyz">
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem value="home">Home</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    const group = container.querySelector("[command-palette-group]")
    expect(group?.hasAttribute("hidden")).toBe(true)
  })

  it("keeps a forceMount group visible even with non-matching search", async () => {
    const { container } = await render(
      <Command search="xyz">
        <CommandList>
          <CommandGroup forceMount heading="Pinned">
            <CommandItem value="home">Home</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    const group = container.querySelector("[command-palette-group]")
    expect(group?.hasAttribute("hidden")).toBe(false)
  })

  it("explicit groupId prop overrides inherited context", async () => {
    const { container } = await render(
      <Command>
        <CommandList>
          <CommandGroup heading="Navigation">
            <CommandItem groupId="explicit" value="home">
              Home
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )

    const group = container.querySelector("[command-palette-group]")
    expect(group?.hasAttribute("hidden")).toBe(true)
  })
})
