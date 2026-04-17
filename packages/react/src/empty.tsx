import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { useCommandSlice } from './context'

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { children, ...rest },
  ref,
) {
  const isEmpty = useCommandSlice((s) => s.getState().filteredOrder.length === 0)
  if (!isEmpty) return null
  return (
    <div ref={ref} cmdk-empty="" role="presentation" {...rest}>
      {children}
    </div>
  )
})
