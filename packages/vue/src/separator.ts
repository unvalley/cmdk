import { type DefineComponent, defineComponent, h, mergeProps, type VNode } from "vue"
import { useCommandSlice } from "./context"

type CommandSeparatorPropsOptions = {
  alwaysRender: BooleanConstructor
}

export const commandSeparatorProps: CommandSeparatorPropsOptions = {
  alwaysRender: Boolean,
}

/**
 * Props for a visual divider between sections of command results.
 */
export type CommandSeparatorProps = {
  /** Keep the separator visible even while a search query is active. */
  alwaysRender?: boolean
}

/** Renders a separator, hiding it during search unless `alwaysRender` is set. */
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
