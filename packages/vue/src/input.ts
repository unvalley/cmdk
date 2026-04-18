import { type DefineComponent, defineComponent, h, mergeProps, ref, type VNode, watch } from "vue"
import { useCommandSlice, useCommandStore } from "./context"

type CommandInputPropsOptions = {
  modelValue: StringConstructor
}

export const commandInputProps: CommandInputPropsOptions = {
  modelValue: String,
}

export type CommandInputProps = {
  modelValue?: string
}

export const CommandInput: DefineComponent<CommandInputProps> = defineComponent({
  name: "CommandInput",
  inheritAttrs: false,
  props: commandInputProps,
  emits: {
    "update:modelValue": (_value: string): boolean => true,
  },
  setup(props, { attrs, emit }): () => VNode {
    const store = useCommandStore()
    const search = useCommandSlice((state) => state.search)
    const hasVisibleItems = useCommandSlice((state) => state.filteredOrder.length > 0)
    const pendingValue = ref("")

    watch(
      () => props.modelValue,
      (value) => {
        if (value === undefined) return
        if (store.getState().search === value) return
        store.setSearch(value)
      },
      { immediate: true },
    )

    const handleInput = (event: Event): void => {
      const target = event.target as HTMLInputElement
      if (store.getState().isComposing) {
        pendingValue.value = target.value
        return
      }

      store.setSearch(target.value)
      emit("update:modelValue", target.value)
    }

    const handleCompositionStart = (event: CompositionEvent): void => {
      store.setComposing(true)
      pendingValue.value = (event.target as HTMLInputElement).value
    }

    const handleCompositionEnd = (event: CompositionEvent): void => {
      store.setComposing(false)
      const target = event.target as HTMLInputElement
      const finalValue = target.value || pendingValue.value
      store.setSearch(finalValue)
      emit("update:modelValue", finalValue)
      pendingValue.value = ""
    }

    return (): VNode =>
      h(
        "input",
        mergeProps(
          {
            "command-palette-input": "",
            role: "combobox",
            "aria-autocomplete": "list",
            "aria-expanded": hasVisibleItems.value ? "true" : "false",
            autoComplete: "off",
            autoCorrect: "off",
            spellcheck: false,
            value: props.modelValue ?? search.value,
            onInput: handleInput,
            onCompositionstart: handleCompositionStart,
            onCompositionend: handleCompositionEnd,
          },
          attrs,
        ),
      )
  },
})
