import {
  type DefineComponent,
  defineComponent,
  type ExtractPublicPropTypes,
  h,
  mergeProps,
  type VNode,
} from "vue"

type CommandLoadingPropsOptions = {
  progress: NumberConstructor
}

export const commandLoadingProps: CommandLoadingPropsOptions = {
  progress: Number,
}

export type CommandLoadingProps = ExtractPublicPropTypes<typeof commandLoadingProps>

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
