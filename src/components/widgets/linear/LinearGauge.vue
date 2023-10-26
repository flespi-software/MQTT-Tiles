<template>
  <canvas class="canvas-gauges"></canvas>
</template>

<script>
import { LinearGauge } from 'canvas-gauges'
import merge from 'lodash/merge'
import throttle from 'lodash/throttle'
// const setValue = throttle((guage, value) => {
//   guage.value = value
// }, 1000, { trailing: true })
export default {
  props: {
    value: Number,
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      currentOptions: merge({}, this.options),
      chart: null
    }
  },
  mounted () {
    if (this.value) { this.currentOptions.value = JSON.parse(JSON.stringify(this.value)) }
    this.currentOptions.renderTo = this.$el
    this.chart = new LinearGauge(this.currentOptions).draw()
  },
  beforeDestroy () {
    this.chart.destroy()
  },
  watch: {
    options: {
      deep: true,
      handler (options) {
        this.currentOptions = merge(this.currentOptions, options)
        this.chart.update(this.currentOptions)
      }
    },
    value (value) {
      this.setValue(this.chart, value)
    }
  },
  methods: {
    setValue: (guage, value) => {
      guage.value = JSON.parse(JSON.stringify(value))
    }
  }
}
</script>
