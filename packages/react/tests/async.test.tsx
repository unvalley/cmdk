import { act, render, screen } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Command } from '../src/command'
import { Item } from '../src/item'
import { List } from '../src/list'

describe('async items (regressions)', () => {
  it('async items render correctly when added after mount (#280)', async () => {
    function Demo() {
      const [items, setItems] = useState<string[]>([])
      useEffect(() => {
        Promise.resolve().then(() => setItems(['x', 'y', 'z']))
      }, [])
      return (
        <Command>
          <List>
            {items.map((v) => (
              <Item key={v} value={v}>
                {v}
              </Item>
            ))}
          </List>
        </Command>
      )
    }
    render(<Demo />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
    expect(screen.getByText('z')).toBeInTheDocument()
  })

  it('selection updates when items are replaced (#267)', async () => {
    function Demo({ items }: { items: string[] }) {
      return (
        <Command>
          <List>
            {items.map((v) => (
              <Item key={v} value={v}>
                {v}
              </Item>
            ))}
          </List>
        </Command>
      )
    }
    const { rerender } = render(<Demo items={['a', 'b']} />)
    rerender(<Demo items={['x', 'y']} />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.queryByText('a')).not.toBeInTheDocument()
  })
})
