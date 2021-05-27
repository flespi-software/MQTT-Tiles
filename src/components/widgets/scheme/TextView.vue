<template>
  <text-view
    class="scheme__text" ref="text"
    :class="[...item.settings.modificators.map(val => `text-${val}`), `${needOverflow ? 'scheme__text--block' : ''}`]"
    :style="{color: item.settings.color}"
    :text="text"
    :title="item.label"
    :prefix="item.settings.prefix"
    :postfix="item.settings.postfix"
    :settings="item.settings"
  />
</template>

<script>
import TextView from '../TextView'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import fitty from 'fitty'
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON,
  WIDGET_VALUE_FORMAT_DURATION
} from '../../../constants'
export default {
  props: ['item', 'value', 'widget'],
  components: { TextView },
  data () {
    return {
      textEl: null,
      WIDGET_VALUE_FORMAT_STRING,
      WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
      WIDGET_VALUE_FORMAT_DATE,
      WIDGET_VALUE_FORMAT_PRE,
      WIDGET_VALUE_FORMAT_MARKDOWN,
      WIDGET_VALUE_FORMAT_JSON,
      WIDGET_VALUE_FORMAT_DURATION
    }
  },
  computed: {
    needOverflow () {
      const format = this.item.settings.valueFormat
      return format === WIDGET_VALUE_FORMAT_JSON || format === WIDGET_VALUE_FORMAT_MARKDOWN
    },
    title () {
      let text
      if (this.value) {
        text = this.getValueByTopic(this.value, this.item.topic)
      } else {
        const format = this.item.settings.valueFormat
        if (format === WIDGET_VALUE_FORMAT_JSON) {
          text = JSON.stringify({ label: 'value', some: 'example' })
        } else if (format === WIDGET_VALUE_FORMAT_DURATION || format === WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE) {
          text = 100
        } else if (format === WIDGET_VALUE_FORMAT_DATE) {
          text = Date.now()
        } else {
          text = this.item.label
        }
      }
      return text
    },
    text () {
      return this.formatValue(this.title, this.item.settings)
    }
  },
  methods: {
    onResize () {
      this.textEl.fit()
    }
  },
  mounted () {
    this.textEl = fitty(this.$refs.text.$el, { minSize: 8, maxSize: 75 })
  },
  beforeDestroy () {
    this.textEl.unsubscribe()
  },
  watch: {
    'widget.settings.height' () { this.onResize() },
    'widget.settings.width' () { this.onResize() },
    'item.width' () { this.onResize() },
    'item.height' () { this.onResize() },
    'item.settings.modificators': {
      deep: true,
      handler () { this.onResize() }
    },
    value () { this.onResize() }
  },
  mixins: [getValueByTopic, formatValue]
}
</script>

<style lang="stylus" scoped>
  .scheme__text
    &--block
      overflow auto
      width 100%
      height 100%
    white-space normal
    word-break break-all
</style>
