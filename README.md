# cmdk

Framework-agnostic command menu primitives.

- `@unvalley/cmdk-core`: store, filtering, ordering, selection, IME handling
- `@unvalley/cmdk-react`: unstyled React components built on that store

## Install

```bash
pnpm add @unvalley/cmdk-core
pnpm add @unvalley/cmdk-react react react-dom
```

## React

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@unvalley/cmdk-react'

export function CommandMenu() {
  return (
    <Command label="Command Menu">
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Letters">
          <CommandItem value="a">A</CommandItem>
          <CommandItem value="b">B</CommandItem>
        </CommandGroup>
        <CommandItem value="apple" keywords={['fruit']}>
          Apple
        </CommandItem>
      </CommandList>
    </Command>
  )
}
```

For modal usage:

```tsx
<CommandDialog open={open} onOpenChange={setOpen} label="Global Command Menu">
  <CommandInput placeholder="Type a command…" />
  <CommandList>
    <CommandItem value="theme">Change theme</CommandItem>
    <CommandItem value="settings">Open settings</CommandItem>
  </CommandList>
</CommandDialog>
```

### `Command` props

- `label?: string`
  Accessible label for the command surface.
- `value?: string`
  Controlled highlighted item value.
- `defaultValue?: string`
  Initial highlighted item value for uncontrolled usage.
- `onValueChange?: (value: string) => void`
  Called when the highlighted item changes.
- `search?: string`
  Controlled search query.
- `defaultSearch?: string`
  Initial search query for uncontrolled usage.
- `onSearchChange?: (search: string) => void`
  Called when the search query changes.
- `filter?: 'fuzzy' | 'contains' | 'none' | FilterFn`
  Built-in filter mode or a custom scoring function.
- `loop?: boolean`
  Wrap keyboard navigation from end to start and back.
- `selectOnHover?: boolean`
  When `true`, pointer hover updates selection. Defaults to `true`.

### `CommandInput` props

- All normal `input` props except `onChange`
- `value?: string`
  Controlled input value.
- `onValueChange?: (value: string) => void`
  Called after the input value is committed.

IME composition is handled so partial composition does not trigger intermediate search updates.

### `CommandItem` props

- `value: string`
  Stable item identity.
- `keywords?: readonly string[]`
  Extra aliases used by filtering.
- `disabled?: boolean`
  Renders the item but removes it from selection and keyboard navigation.
- `forceMount?: boolean`
  Keeps the item visible even when filtering would hide it.
- `groupId?: string`
  Explicit group association. Usually inherited from `CommandGroup`.
- `onSelect?: (value: string, event?: Event) => void`
  Called when the item is activated.

### `CommandGroup`

Groups related items under an optional `heading`. Hidden automatically when no item in the group is visible, unless `forceMount` is set.

### `CommandDialog` props

Extends `Command` and adds:

- `open: boolean`
  Controls whether the dialog is open.
- `onOpenChange: (open: boolean) => void`
  Called when the dialog opens or closes.
- `dialogClassName?: string`
  Class name for the native `<dialog>`.
- `resetSearchOnClose?: boolean`
  Clears uncontrolled search when closing. Defaults to `true`.

Other helpers:

- `CommandList`: listbox wrapper
- `CommandEmpty`: only renders when no visible items remain
- `CommandSeparator`: hidden while searching unless `alwaysRender`
- `CommandLoading`: progressbar helper

### Hooks

- `useCommandStore()`: returns the underlying store
- `useCommandSlice(selector)`: subscribes to derived `CommandState`

```tsx
function ResultCount() {
  const count = useCommandSlice((state) => state.filteredOrder.length)
  return <span>{count} results</span>
}
```

## Core

```ts
import { createCommand } from '@unvalley/cmdk-core'

const command = createCommand({
  filter: 'contains',
  initialSearch: 'app',
  onValueChange: (value) => console.log(value),
})

command.registerItem({ value: 'apple' })
command.registerItem({ value: 'banana', keywords: ['fruit'] })

command.selectFirst()
command.triggerSelect()
```

### `createCommand(options?)`

- `initialValue?: string`
  Initial highlighted item.
- `initialSearch?: string`
  Initial search query.
- `filter?: 'fuzzy' | 'contains' | 'none' | FilterFn`
  Built-in filter mode or custom scoring function.
- `loop?: boolean`
  Wrap keyboard navigation.
- `selectOnHover?: boolean`
  Whether pointer hover updates selection.
- `onValueChange?: (value: string) => void`
  Called when highlighted value changes.
- `onSearchChange?: (search: string) => void`
  Called when search changes.

### `CommandStore`

Main methods:

- `registerItem(item)` / `registerGroup(group)`
- `updateItem(value, patch)`
- `updateOptions(patch)`
- `setSearch(search)` / `setValue(value)` / `setComposing(isComposing)`
- `selectNext()` / `selectPrev()` / `selectFirst()` / `selectLast()`
- `triggerSelect(event?)`
- `getState()`
- `subscribe(listener)`
- `subscribeSlice(selector, listener, isEqual?)`

`updateOptions()` updates `filter`, `loop`, `selectOnHover`, and callbacks after creation.

### Filtering

- `fuzzy`: default fuzzy scorer
- `contains`: normalized substring matching, with a slight preference for matches at the start or after a separator
- `none`: disables internal filtering and sorting

Custom filters return `0` to hide an item and `> 0` to keep it visible. Higher scores sort earlier.

## Styling

The React package is unstyled. Useful selectors:

- `[cmdk-root]`
- `[cmdk-dialog]`
- `[cmdk-input]`
- `[cmdk-list]`
- `[cmdk-item]`
- `[cmdk-group]`
- `[cmdk-group-heading]`
- `[cmdk-group-items]`
- `[cmdk-empty]`
- `[cmdk-separator]`
- `[cmdk-loading]`
- `[data-selected]`
- `[data-disabled]`
