import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Command } from '../src/command'

describe('<Command>', () => {
  it('renders children', () => {
    render(
      <Command>
        <div>hello</div>
      </Command>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders with cmdk-root data attribute', () => {
    const { container } = render(<Command label="test" />)
    expect(container.querySelector('[cmdk-root]')).toBeInTheDocument()
  })

  it('forwards label as aria-label', () => {
    const { container } = render(<Command label="My Menu" />)
    expect(container.querySelector('[cmdk-root]')?.getAttribute('aria-label')).toBe(
      'My Menu',
    )
  })
})
