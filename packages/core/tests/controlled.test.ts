import { describe, expect, it, vi } from 'vitest'
import { createCommand } from '../src/store'

describe('createCommand: IME composition', () => {
  it('exposes isComposing in state', () => {
    const cmd = createCommand()
    expect(cmd.getState().isComposing).toBe(false)
    cmd.setComposing(true)
    expect(cmd.getState().isComposing).toBe(true)
    cmd.setComposing(false)
    expect(cmd.getState().isComposing).toBe(false)
  })

  it('setComposing notifies subscribers', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    cmd.subscribe(listener)
    cmd.setComposing(true)
    expect(listener).toHaveBeenCalled()
  })

  it('setComposing(same) is a no-op (no notify)', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    cmd.subscribe(listener)
    cmd.setComposing(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('createCommand: controlled mode', () => {
  it('honors initial value', () => {
    const cmd = createCommand({ value: 'apple' })
    cmd.registerItem({ value: 'apple' })
    expect(cmd.getState().value).toBe('apple')
  })

  it('honors initial search', () => {
    const cmd = createCommand({ search: 'foo' })
    expect(cmd.getState().search).toBe('foo')
  })
})
