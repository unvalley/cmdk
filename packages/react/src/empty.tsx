import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { useCommandSlice } from './context'

export type EmptyProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

export const Empty = ({ ref, children, ...rest }: EmptyProps) => {
  const isEmpty = useCommandSlice((s) => s.getState().filteredOrder.length === 0)
  if (!isEmpty) return null
  return (
    <div ref={ref} cmdk-empty="" role="presentation" {...rest}>
      {children}
    </div>
  )
}
