<template>
  <div class="text-center full-height" ref="wrapper">
    <q-resize-observer @resize="onResize" />
    <q-icon
      :style="{
        color: activeItem.color,
        fontSize: `${size}px`,
        height: activeItem.label && item.settings.isNeedShowTitles ? 'calc(100% - 25px)' : '100%'
      }"
      :name="`mdi-${activeItem.icon || item.settings.defaultIcon}`"
      style="width: 100%;"
    />
  </div>
</template>

<script>
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  props: ['item', 'value', 'widget'],
  data () {
    return {
      valueExpired: false,
      expireValueTimeoutId: 0,
      wrapperSize: { width: 15, height: 15 }
    }
  },
  computed: {
    size () {
      const { width, height } = this.wrapperSize,
        active = height > width ? width : height
      return active
    },
    currentValue: {
      get () {
        const value = this.value
        if (this.item.settings.resetTimeout) {
          this.setExpireLogic()
        } else {
          this.clearExpireLogic()
        }
        if (value === null || this.valueExpired) {
          return null
        } else {
          return this.mathProcessing(this.getValueByTopic(value, this.item.topic), this.item.settings.math)
        }
      },
      set (val) {
        this.setAction(val)
        this.actionHandler()
      }
    },
    activeItem () {
      const defaultItem = this.item.settings.items[0]
      const activeItem = this.item.settings.items.slice(1).filter(item => item.val === this.mathProcessing(this.currentValue, item.math))
      return activeItem[0] || defaultItem
    }
  },
  methods: {
    onResize (wrapperSize) { this.wrapperSize = { ...wrapperSize } },
    setExpireLogic () {
      if (this.expireValueTimeoutId) {
        clearTimeout(this.expireValueTimeoutId)
        this.expireValueTimeoutId = 0
      }
      const now = Date.now(),
        expiredTime = this.time + this.item.settings.resetTimeout * 1000
      if (now > expiredTime) {
        this.valueExpired = true
      } else {
        this.valueExpired = false
        this.expireValueTimeoutId = setTimeout(() => {
          this.valueExpired = true
        }, expiredTime - now)
      }
    },
    clearExpireLogic () {
      this.valueExpired = false
      if (this.expireValueTimeoutId) {
        clearTimeout(this.expireValueTimeoutId)
        this.expireValueTimeoutId = 0
      }
    }
  },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
