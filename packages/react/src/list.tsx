import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  { children, ...rest },
  ref,
) {
  return (
    <div ref={ref} cmdk-list="" role="listbox" {...rest}>
      {children}
    </div>
  )
})
