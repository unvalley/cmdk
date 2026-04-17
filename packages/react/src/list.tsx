import type { HTMLAttributes, ReactNode, Ref } from 'react'

export type ListProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

export const List = ({ ref, children, ...rest }: ListProps) => (
  <div ref={ref} cmdk-list="" role="listbox" {...rest}>
    {children}
  </div>
)
