<template>
  <div ref="text" class="scheme__text" :class="item.settings.modificators.map(val => `text-${val}`)" :style="`color:${item.settings.color}; ${item.settings.style}`">
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
    fitInit () {
      this.textEl = fitty(this.$refs.text, { minSize: 8, maxSize: 75 })
    },
    fitRemove () {
      this.textEl.unsubscribe()
    },
    fit () {
      if (this.item.settings.autoresize) {
        this.textEl.fit()
      }
    }
  },
  mounted () {
    if (this.item.settings.autoresize) {
      this.fitInit()
    }
  },
  beforeDestroy () {
    if (this.item.settings.autoresize) {
      this.fitRemove()
    }
  },
  watch: {
    'widget.settings.height' () { this.fit() },
    'widget.settings.width' () { this.fit() },
    'item.width' () { this.fit() },
    'item.height' () { this.fit() },
    'item.settings.modificators': {
      deep: true,
      handler () { this.fit() }
    },
    'item.settings.autoresize' (val) {
      if (val) {
        this.fitInit()
      } else {
        this.fitRemove()
      }
    }
  }
}
</script>
