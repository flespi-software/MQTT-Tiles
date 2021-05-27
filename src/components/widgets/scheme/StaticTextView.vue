<template>
  <div ref="text" class="scheme__text ellipsis text-center" :class="item.settings.modificators.map(val => `text-${val}`)" :style="{color: item.settings.color}">
    {{item.settings.label}}
  </div>
</template>

<script>
import fitty from 'fitty'
export default {
  props: ['item', 'value', 'widget'],
  data () {
    return {
      textEl: null
    }
  },
  methods: {
    fit () {
      this.textEl.fit()
    }
  },
  mounted () {
    this.textEl = fitty(this.$refs.text, { minSize: 8, maxSize: 75 })
  },
  beforeDestroy () {
    this.textEl.unsubscribe()
  },
  watch: {
    'widget.settings.height' () { this.fit() },
    'widget.settings.width' () { this.fit() },
    'item.width' () { this.fit() },
    'item.height' () { this.fit() },
    'item.settings.modificators': {
      deep: true,
      handler () { this.fit() }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .scheme__text
    white-space pre-wrap
    word-break break-word
</style>
