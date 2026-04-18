import { type DefineComponent, defineComponent, h, mergeProps, type VNode } from "vue"

type CommandLoadingPropsOptions = {
  progress: NumberConstructor
}

export const commandLoadingProps: CommandLoadingPropsOptions = {
  progress: Number,
}

/**
 * Props for the loading indicator shown inside the command palette.
 */
export type CommandLoadingProps = {
  /** 0..1 progress value surfaced as `aria-valuenow` when set. */
  progress?: number
}

/** Renders a progressbar-compatible loading region. */
export const CommandLoading: DefineComponent<CommandLoadingProps> = defineComponent({
  name: "CommandLoading",
  inheritAttrs: false,
  props: commandLoadingProps,
  setup(props, { attrs, slots }): () => VNode {
    return (): VNode =>
      h(
        "div",
        mergeProps(
          {
            "command-palette-loading": "",
            role: "progressbar",
            "aria-valuenow":
              props.progress != null ? Math.round(props.progress * 100).toString() : undefined,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
          },
          attrs,
        ),
        slots.default?.(),
      )
  },
})
