<template>
  <canvas class="canvas-gauges"></canvas>
</template>

<script>
import { LinearGauge } from 'canvas-gauges'
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
      chart: null
    }
  },
  mounted () {
    if (this.value) { this.options.value = this.value }
    this.options.renderTo = this.$el
    this.chart = new LinearGauge(this.options).draw()
  },
  beforeDestroy () {
    this.chart.destroy()
  },
  watch: {
    options: {
      deep: true,
      handler (options) {
        this.chart.update(options)
      }
    },
    value (value) {
      this.chart.value = value
    }
  }
}
</script>
