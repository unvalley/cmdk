import { type HTMLAttributes, forwardRef } from 'react'
import { useCommandSlice } from './context'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  alwaysRender?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { alwaysRender, ...rest },
  ref,
) {
  const search = useCommandSlice((s) => s.getState().search)
  if (!alwaysRender && search !== '') return null
  return <div ref={ref} cmdk-separator="" role="separator" {...rest} />
})
