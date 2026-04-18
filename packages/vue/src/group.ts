import { type DefineComponent, defineComponent, h, mergeProps, provide, type VNode, watch } from "vue"
import { GroupIdKey, useCommandId, useCommandSlice, useCommandStore } from "./context"

type CommandGroupPropsOptions = {
  heading: StringConstructor
  forceMount: BooleanConstructor
}

export const commandGroupProps: CommandGroupPropsOptions = {
  heading: String,
  forceMount: Boolean,
}

export type CommandGroupProps = {
  heading?: string
  forceMount?: boolean
}

export const CommandGroup: DefineComponent<CommandGroupProps> = defineComponent({
  name: "CommandGroup",
  inheritAttrs: false,
  props: commandGroupProps,
  setup(props, { attrs, slots }): () => VNode {
    const store = useCommandStore()
    const id = useCommandId("group")

    watch(
      () => props.forceMount,
      (forceMount, _previousValue, onCleanup) => {
        const unregister = store.registerGroup({ id, forceMount })
        onCleanup(unregister)
      },
      { immediate: true },
    )

    provide(GroupIdKey, id)

    const isVisible = useCommandSlice((state) => state.visibleGroups.has(id))

    return (): VNode => {
      const headingContent = slots.heading?.() ?? props.heading

      return h(
        "div",
        mergeProps(
          {
            "command-palette-group": "",
            role: "presentation",
            hidden: !isVisible.value || undefined,
            "data-group-id": id,
          },
          attrs,
        ),
        [
          headingContent != null
            ? h(
                "div",
                {
                  id,
                  "command-palette-group-heading": "",
                },
                headingContent,
              )
            : null,
          h(
            "div",
            {
              "command-palette-group-items": "",
              role: "group",
              "aria-labelledby": headingContent != null ? id : undefined,
            },
            slots.default?.(),
          ),
        ],
      )
    }
  },
})
