import { type DefineComponent, defineComponent, h, mergeProps, type VNode } from "vue"
import { useCommandA11y } from "./context"

/** Renders the `listbox` container that owns visible command items. */
export const CommandList: DefineComponent = defineComponent({
  name: "CommandList",
  inheritAttrs: false,
  setup(_props, { attrs, slots }): () => VNode {
    const { listId } = useCommandA11y()

    return (): VNode =>
      h(
        "div",
        mergeProps(
          {
            id: listId,
            "command-palette-list": "",
            role: "listbox",
          },
          attrs,
        ),
        slots.default?.(),
      )
  },
})
