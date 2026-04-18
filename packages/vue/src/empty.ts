import { type DefineComponent, defineComponent, h, mergeProps, type VNode } from "vue"
import { useCommandSlice } from "./context"

export const CommandEmpty: DefineComponent = defineComponent({
  name: "CommandEmpty",
  inheritAttrs: false,
  setup(_props, { attrs, slots }): () => VNode | null {
    const isEmpty = useCommandSlice((state) => state.filteredOrder.length === 0)

    return (): VNode | null => {
      if (!isEmpty.value) return null

      return h(
        "div",
        mergeProps(
          {
            "command-palette-empty": "",
            role: "presentation",
          },
          attrs,
        ),
        slots.default?.(),
      )
    }
  },
})
