import {
  type DefineComponent,
  defineComponent,
  type ExtractPublicPropTypes,
  h,
  mergeProps,
  type VNode,
} from "vue"
import { useCommandSlice } from "./context"

type CommandSeparatorPropsOptions = {
  alwaysRender: BooleanConstructor
}

export const commandSeparatorProps: CommandSeparatorPropsOptions = {
  alwaysRender: Boolean,
}

export type CommandSeparatorProps = ExtractPublicPropTypes<typeof commandSeparatorProps>

export const CommandSeparator: DefineComponent<CommandSeparatorProps> = defineComponent({
  name: "CommandSeparator",
  inheritAttrs: false,
  props: commandSeparatorProps,
  setup(props, { attrs }): () => VNode | null {
    const search = useCommandSlice((state) => state.search)

    return (): VNode | null => {
      if (!props.alwaysRender && search.value !== "") return null

      return h(
        "div",
        mergeProps(
          {
            "command-palette-separator": "",
            role: "separator",
          },
          attrs,
        ),
      )
    }
  },
})
