import type { HTMLAttributes, Ref } from 'react'
import { useCommandSlice } from './context'

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
  alwaysRender?: boolean
}

export const Separator = ({ ref, alwaysRender, ...rest }: SeparatorProps) => {
  const search = useCommandSlice((s) => s.getState().search)
  if (!alwaysRender && search !== '') return null
  // biome-ignore lint/a11y/useFocusableInteractive: separator is a visual divider, not interactive
  return <div ref={ref} cmdk-separator="" role="separator" {...rest} />
}
