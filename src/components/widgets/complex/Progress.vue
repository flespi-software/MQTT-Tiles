<template>
  <div
    class="q-pa-xs"
    :class="{ 'bg-grey-3': selected, 'rounded-borders': selected, [`text-${color}-7`]: true }"
  >
    <div>{{item.label}}</div>
    <q-linear-progress :value="percentage / 100" :color="`${color}-7`" style="min-width: 150px" />
    <div style="float: right; font-size: .8rem">{{`${value === undefined ? 'value' : value}/${value === undefined ? 'max' : item.max}`}}</div>
  </div>
</template>
<script>
export default {
  name: 'Progress',
  props: ['item', 'value', 'selected', 'color'],
  computed: {
    percentage () {
      if (typeof this.value === 'undefined' || this.value === null || this.value === 'N/A') { return 0 }
      return ((this.value - this.item.min) * 100) / (this.item.max - this.item.min)
    }
  }
}
</script>
