import {
  type HTMLAttributes,
  type JSX,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useRef,
} from "react"
import { GroupContext, useCommandA11y, useCommandSlice, useCommandStore } from "./context"

/**
 * Props for a selectable command option.
 *
 * Additional HTML attributes are forwarded to the rendered option element.
 */
export type CommandItemProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  /** Ref forwarded to the rendered option element. */
  ref?: Ref<HTMLDivElement>
  /**
   * Stable identity for this item.
   *
   * Used for registration, filtering, selection, and `onSelect`, so it should
   * be unique within the command palette and remain stable across renders.
   */
  value: string
  /** Extra search terms that should match this item. */
  keywords?: readonly string[]
  /** Prevents pointer and keyboard selection for this item. */
  disabled?: boolean
  /** Keep the item mounted even when it does not currently match the search. */
  forceMount?: boolean
  /** Explicit group id. Defaults to the nearest `CommandGroup` when omitted. */
  groupId?: string
  /** Called when the item is activated. */
  onSelect?: (value: string, event?: Event) => void
  /** Visible item content. */
  children?: ReactNode
}

/** Registers and renders a single selectable option inside the command list. */
export const CommandItem = ({
  ref,
  value,
  keywords,
  disabled,
  forceMount,
  groupId: groupIdProp,
  onSelect,
  children,
  ...rest
}: CommandItemProps): JSX.Element | null => {
  const store = useCommandStore()
  const { getItemId } = useCommandA11y()
  const id = getItemId(value)
  // Prop wins; otherwise inherit from the nearest <CommandGroup>.
  const inheritedGroupId = useContext(GroupContext)
  const groupId = groupIdProp ?? inheritedGroupId ?? undefined

  // Stable refs so the registered onSelect always sees the latest closure.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Register on mount, unregister on unmount.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally omit keywords/disabled/forceMount/groupId — they are patched via updateItem
  useEffect(() => {
    const unregister = store.registerItem({
      value,
      keywords,
      disabled,
      forceMount,
      groupId,
      onSelect: (v, e) => onSelectRef.current?.(v, e),
    })
    return unregister
  }, [store, value])

  // Patch other props that don't change identity.
  useEffect(() => {
    store.updateItem(value, { keywords, disabled, forceMount, groupId })
  }, [store, value, keywords, disabled, forceMount, groupId])

  const isVisible = useCommandSlice((s) => s.visibleSet.has(value))
  const isSelected = useCommandSlice((s) => s.hasValue && s.value === value)
  const selectOnHover = useCommandSlice((s) => s.selectOnHover)

  if (!isVisible) return null

  const handlePointerMove = (): void => {
    if (disabled) return
    if (!selectOnHover) return
    store.setValue(value)
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (disabled) return
    store.setValue(value)
    store.triggerSelect(e.nativeEvent)
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: items are navigated via arrow keys on the root, not individually focused
    // biome-ignore lint/a11y/useFocusableInteractive: items are navigated via the input, not directly focused
    <div
      ref={ref}
      command-palette-item=""
      id={id}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-selected={isSelected || undefined}
      data-disabled={disabled || undefined}
      {...rest}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
