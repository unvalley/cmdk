const encodeItemValue = (value: string): string => {
  return `${value.length}:${encodeURIComponent(value)}`
}

export const createCommandListId = (baseId: string): string => `${baseId}-list`

export const createCommandItemId = (baseId: string, value: string): string =>
  `${baseId}-item-${encodeItemValue(value)}`
