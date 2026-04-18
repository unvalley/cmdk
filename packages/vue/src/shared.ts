import type { CommandFilter } from "@command-palette/core"
import type { ExtractPublicPropTypes, PropType } from "vue"

type CommandPropsOptions = {
  label: StringConstructor
  modelValue: StringConstructor
  defaultValue: StringConstructor
  search: StringConstructor
  defaultSearch: StringConstructor
  filter: PropType<CommandFilter>
  loop: BooleanConstructor
  selectOnHover: {
    type: PropType<boolean | undefined>
    default: undefined
  }
}

export const commandProps: CommandPropsOptions = {
  label: String,
  modelValue: String,
  defaultValue: String,
  search: String,
  defaultSearch: String,
  filter: [String, Function] as PropType<CommandFilter>,
  loop: Boolean,
  selectOnHover: {
    type: null as unknown as PropType<boolean | undefined>,
    default: undefined,
  },
} as const

export type CommandProps = ExtractPublicPropTypes<typeof commandProps>
