<template>
  <div class="text-center full-height" ref="wrapper">
    <q-resize-observer @resize="onResize" />
    <q-icon
      @click.native="actionHandler"
      :size="`${size}px`"
      :color="item.currentValue === null ? 'grey-4' : currentValue ? `${widget.color}-7` : `grey-6`"
      :name="currentValue ? `mdi-${item.settings.trueIcon || 'toggle-switch-outline'}` : `mdi-${item.settings.falseIcon || 'toggle-switch-off-outline'}`"
      :class="[`${isActiveWidget ? 'cursor-pointer' : ''}`]"
    />
  </div>
</template>

<script>
import JSONPath from 'jsonpath'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
const DEFAULT_MODE = 0,
  COMMAND_MODE = 1
export default {
  props: ['item', 'value', 'widget'],
  data () {
    return {
      wrapperSize: { width: 15, height: 15 }
    }
  },
  computed: {
    size () {
      const { width, height } = this.wrapperSize,
        active = height > width ? width : height
      return active
    },
    actionTopic () {
      let topic = null
      if (this.currentValue === null) {
        topic = null
      } else if (this.item.settings.mode === COMMAND_MODE) {
        topic = this.currentValue ? this.item.settings.falseActionTopic : this.item.settings.trueActionTopic
      } else {
        topic = this.item.topic.topicTemplate
      }
      return topic
    },
    isActiveWidget () {
      return !!this.actionTopic && ((this.item.settings.mode === COMMAND_MODE) || (!this.item.settings.math && this.item.settings.mode === DEFAULT_MODE))
    },
    currentValue () {
      const trueValue = this.item.settings.trueValue
      const falseValue = this.item.settings.falseValue
      const value = this.value !== null
        ? this.mathProcessing(this.getValueByTopic(this.value, this.item.topic), this.item.settings.math)
        : this.value
      const result = value === trueValue
        ? true : value === falseValue
          ? false : null
      return result
    }
  },
  methods: {
    onResize (wrapperSize) { this.wrapperSize = { ...wrapperSize } },
    getValue () {
      let value = ''
      if (this.item.settings.mode === COMMAND_MODE) {
        value = this.currentValue ? this.item.settings.falsePayload : this.item.settings.truePayload
      } else {
        const value = this.value !== null
          ? this.getValueByTopic(this.value, this.item.topic)
          : this.value
        return (value === this.item.settings.trueValue)
          ? this.item.settings.falseValue : (value === this.item.settings.falseValue)
            ? this.item.settings.trueValue : value
              ? this.item.settings.falseValue : this.item.settings.trueValue
      }
      return value
    },
    actionHandler () {
      if (this.currentValue !== null && this.isActiveWidget) {
        const val = this.getValue()
        const topic = this.actionTopic
        let payload = val
        const firstDataTopic = this.item.topic
        if (this.item.settings.mode === DEFAULT_MODE && firstDataTopic.payloadField) {
          payload = this.getCleanValue(this.value[topic] && this.value[topic].payload, firstDataTopic)
          if (payload !== 'N/A') {
            JSONPath.apply(payload, firstDataTopic.payloadField, () => val)
            payload = JSON.stringify(payload)
          }
        }
        const data = { topic, payload, settings: { retain: this.item.settings.save } }
        this.$emit('action', data)
      }
    }
  },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
