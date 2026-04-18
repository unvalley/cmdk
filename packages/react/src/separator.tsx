import type { HTMLAttributes, JSX, Ref } from "react"
import { useCommandSlice } from "./context"

/**
 * Props for a visual divider between sections of command results.
 *
 * Additional HTML attributes are forwarded to the separator element.
 */
export type CommandSeparatorProps = HTMLAttributes<HTMLDivElement> & {
  /** Ref forwarded to the separator element. */
  ref?: Ref<HTMLDivElement>
  /** Keep the separator visible even while a search query is active. */
  alwaysRender?: boolean
}

/** Renders a separator, hiding it during search unless `alwaysRender` is set. */
export const CommandSeparator = ({
  ref,
  alwaysRender,
  ...rest
}: CommandSeparatorProps): JSX.Element | null => {
  const search = useCommandSlice((s) => s.search)
  if (!alwaysRender && search !== "") return null
  // biome-ignore lint/a11y/useFocusableInteractive: separator is a visual divider, not interactive
  return <div ref={ref} command-palette-separator="" role="separator" {...rest} />
}
