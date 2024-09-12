<script setup>
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: String
  },
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label :for="id" class="relative block">
    <span class="block text-lg">{{ label }}</span>
    <span class="absolute left-2 top-[55%]">
      <slot name="icon"></slot>
    </span>
    <input
      :type="type"
      :id="id"
      :placeholder="placeholder"
      class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
      v-bind="$attrs"
      :value="modelValue"
      @input="updateValue"
    />
    <slot></slot>
  </label>
</template>
