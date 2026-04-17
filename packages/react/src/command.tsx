import {
  type CommandOptions,
  type CommandStore,
  createCommand,
} from '@unvalley/cmdk-core'
import { type ReactNode, useEffect, useMemo, useRef } from 'react'
import { CommandContext } from './context'

export interface CommandProps extends CommandOptions {
  label?: string
  className?: string
  children?: ReactNode
}

export function Command({
  label,
  className,
  children,
  ...options
}: CommandProps): ReactNode {
  // Create store once. We pass *initial* options only; controlled props are
  // synced via effects below.
  const store = useMemo<CommandStore>(() => createCommand(options), [])

  // Sync controlled value
  const valueProp = options.value
  const lastValue = useRef(valueProp)
  useEffect(() => {
    if (valueProp !== undefined && valueProp !== lastValue.current) {
      lastValue.current = valueProp
      store.setValue(valueProp)
    }
  }, [store, valueProp])

  // Sync controlled search
  const searchProp = options.search
  const lastSearch = useRef(searchProp)
  useEffect(() => {
    if (searchProp !== undefined && searchProp !== lastSearch.current) {
      lastSearch.current = searchProp
      store.setSearch(searchProp)
    }
  }, [store, searchProp])

  return (
    <CommandContext.Provider value={store}>
      <div cmdk-root="" aria-label={label} className={className}>
        {children}
      </div>
    </CommandContext.Provider>
  )
}
