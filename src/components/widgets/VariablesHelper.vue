<template>
  <div style="font-size: .8rem; line-height: 1" class="q-mt-xs">
    You can use variables:
    <span
      v-for="variable in variables"
      :key="variable.name"
      @click="$emit('add', `<%${variable.name}%>`)"
      v-html="`<%${variable.name}%>`"
      class="cursor-pointer q-mr-xs text-grey-9"
    >
    </span>
  </div>
</template>

<script>
export default {
  name: 'VariablesHelper',
  props: ['variables']
}
</script>
