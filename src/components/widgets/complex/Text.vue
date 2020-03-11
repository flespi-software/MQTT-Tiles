<template>
  <div
    class="q-pa-xs"
    :class="{ 'bg-grey-3': selected, 'rounded-borders': selected, [`text-${color}-7`]: true }"
  >
    <div style="word-break: break-all;" class="text-bold">{{item.label}}</div>
    <div style="word-break: break-all; font-size: .8rem;">{{computedValue}}</div>
  </div>
</template>
<script>
import formatValue from '../../../mixins/formatValue.js'
export default {
  name: 'Text',
  props: ['item', 'value', 'selected', 'color'],
  computed: {
    computedValue () {
      const value = this.formatValue(this.value, this.item)
      return value === 'N/A' || value === undefined ? '*novalue*' : value
    }
  },
  mixins: [formatValue]
}
</script>
