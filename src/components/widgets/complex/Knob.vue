<template>
  <div
    class="q-pa-xs"
    :class="{ 'bg-grey-3': selected, 'rounded-borders': selected, [`text-${color}-7`]: true }"
  >
    <q-knob class="q-ma-sm" :thickness="0.1" size="7rem" :value="value === undefined ? 50 : (value === 'N/A' ? 0 : value)" :min="item.min" :max="item.max" readonly show-value :color="`${color}-7`" :track-color="`${color}-2`">
      <div class="text-center" style="font-size: .8rem; width: 100%;">{{item.label}}</div>
      <div class="text-center" style="font-size: .8rem; width: 100%;">{{`${value === undefined ? 'value' : value}/${value === undefined ? 'max' : item.max}`}}</div>
    </q-knob>
  </div>
</template>
<script>
export default {
  name: 'Knob',
  props: ['item', 'value', 'selected', 'color']
}
</script>
