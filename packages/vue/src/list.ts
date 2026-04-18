import { type DefineComponent, defineComponent, h, mergeProps, type VNode } from "vue"

export const CommandList: DefineComponent = defineComponent({
  name: "CommandList",
  inheritAttrs: false,
  setup(_props, { attrs, slots }): () => VNode {
    return (): VNode =>
      h(
        "div",
        mergeProps(
          {
            "command-palette-list": "",
            role: "listbox",
          },
          attrs,
        ),
        slots.default?.(),
      )
  },
})
