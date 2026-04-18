import { type HTMLAttributes, type JSX, type ReactNode, type Ref, useEffect, useId } from "react"
import { GroupContext, useCommandSlice, useCommandStore } from "./context"

/**
 * Props for grouping related command items under an optional heading.
 *
 * Additional HTML attributes are forwarded to the outer group container.
 */
export type CommandGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Ref forwarded to the outer group container. */
  ref?: Ref<HTMLDivElement>
  /** Label rendered above the group items and linked via `aria-labelledby`. */
  heading?: ReactNode
  /** Keep the group mounted even when no items inside currently match. */
  forceMount?: boolean
  /** Group heading and items content. */
  children?: ReactNode
}

/** Renders a labelled collection of related command items. */
export const CommandGroup = ({
  ref,
  heading,
  forceMount,
  children,
  ...rest
}: CommandGroupProps): JSX.Element => {
  const store = useCommandStore()
  const id = useId()

  useEffect(() => store.registerGroup({ id, forceMount }), [store, id, forceMount])

  const isVisible = useCommandSlice((s) => s.visibleGroups.has(id))

  return (
    <div
      ref={ref}
      command-palette-group=""
      role="presentation"
      hidden={!isVisible || undefined}
      data-group-id={id}
      {...rest}
    >
      {heading != null && (
        <div id={id} command-palette-group-heading="">
          {heading}
        </div>
      )}
      <div
        command-palette-group-items=""
        role="group"
        aria-labelledby={heading != null ? id : undefined}
      >
        <GroupContext.Provider value={id}>{children}</GroupContext.Provider>
      </div>
    </div>
  )
}
