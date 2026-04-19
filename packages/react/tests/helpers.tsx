import { render as browserRender } from "vitest-browser-react"

export const render = browserRender

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set

export function setInputValue(input: HTMLInputElement, value: string): void {
  inputValueSetter?.call(input, value)
}

export function dispatchInput(input: HTMLInputElement, value: string): void {
  setInputValue(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
}

export function dispatchCompositionStart(input: HTMLInputElement): void {
  input.dispatchEvent(
    new CompositionEvent("compositionstart", {
      bubbles: true,
      cancelable: true,
      data: input.value,
    }),
  )
}

export function dispatchCompositionEnd(input: HTMLInputElement): void {
  input.dispatchEvent(
    new CompositionEvent("compositionend", {
      bubbles: true,
      cancelable: true,
      data: input.value,
    }),
  )
}

export function dispatchKeyDown(element: Element, init: KeyboardEventInit & { key: string }): void {
  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  )
}
