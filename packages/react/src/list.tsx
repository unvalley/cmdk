import type { HTMLAttributes, JSX, ReactNode, Ref } from "react"

export type CommandListProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

export const CommandList = ({
  ref,
  children,
  ...rest
}: CommandListProps): JSX.Element => (
  <div ref={ref} command-palette-list="" role="listbox" {...rest}>
    {children}
  </div>
)
