import type { HTMLAttributes, JSX, ReactNode, Ref } from "react"
import { useCommandSlice } from "./context"

/**
 * Props for the empty state shown when no items match the current search.
 *
 * Additional HTML attributes are forwarded to the rendered container.
 */
export type CommandEmptyProps = HTMLAttributes<HTMLDivElement> & {
  /** Ref forwarded to the empty-state container. */
  ref?: Ref<HTMLDivElement>
  /** Empty-state content rendered when no results remain. */
  children?: ReactNode
}

/** Conditionally renders its content when the filtered item list is empty. */
export const CommandEmpty = ({ ref, children, ...rest }: CommandEmptyProps): JSX.Element | null => {
  const isEmpty = useCommandSlice((s) => s.filteredOrder.length === 0)
  if (!isEmpty) return null
  return (
    <div command-palette-empty="" ref={ref} role="presentation" {...rest}>
      {children}
    </div>
  )
}
