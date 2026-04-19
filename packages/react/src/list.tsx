import type { HTMLAttributes, JSX, ReactNode, Ref } from "react"
import { useCommandA11y } from "./context"

/**
 * Props for the listbox container that wraps command items.
 *
 * Additional HTML attributes are forwarded to the list element.
 */
export type CommandListProps = HTMLAttributes<HTMLDivElement> & {
  /** Ref forwarded to the list container. */
  ref?: Ref<HTMLDivElement>
  /** Rendered groups, items, separators, and other list content. */
  children?: ReactNode
}

/** Renders the `listbox` container that owns visible command items. */
export const CommandList = ({ ref, children, ...rest }: CommandListProps): JSX.Element => {
  const { listId } = useCommandA11y()

  return (
    <div ref={ref} id={listId} command-palette-list="" role="listbox" {...rest}>
      {children}
    </div>
  )
}
