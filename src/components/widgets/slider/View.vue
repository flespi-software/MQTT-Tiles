<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${currentValueText !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        {{`${currentValueText}`}}
      </div>
      <q-tooltip ref="tooltip">
        {{`${currentValueText}`}}
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else class="full-width full-height">
    <div class="slider__payload q-px-md flex flex-center" style="height: 100%">
      <div style="width: 100%">
        <q-slider
          :value="isValueValid ? currentValue : 0"
          @change="actionHandler"
          :color="`${item.color}-7`"
          :disable="!isValueValid"
          :min="minValue"
          :max="maxValue"
          :step="item.settings.step"
        />
        <div :class="[`text-${item.color}-7`, 'text-bold']">{{currentValueText}}</div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .slider__payload
    font-size 1.2rem
    word-break break-all
    width 100%
    text-align center
</style>

<script>
import JSONPath from 'jsonpath'
import get from 'lodash/get'
import {
  WIDGET_STATUS_DISABLED,
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
export default {
  name: 'Slider',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    actionHandler (val) {
      const topic = this.item.dataTopics[0]
      const topicFilter = topic.topicFilter
      const payloadField = topic.payloadField
      let payload = `${val}`
      if (payloadField) {
        payload = this.getCleanValue(this.value[topicFilter] && this.value[topicFilter].payload, topic)
        if (payload !== 'N/A') {
          JSONPath.apply(payload, payloadField, () => +val)
          payload = JSON.stringify(payload)
        }
      }
      const data = { topic: topicFilter, payload, settings: { retain: this.item.settings.save } }
      this.$emit('action', data)
    }
  },
  computed: {
    valuesBySettings () {
      const valueTopic = this.item.dataTopics[0],
        minTopic = this.item.settings.topics[0],
        maxTopic = this.item.settings.topics[1],
        values = {}
      if (valueTopic) {
        values[valueTopic.topicFilter] = parseFloat(
          this.getValueByTopic(get(this.value, `['${valueTopic.topicFilter}'].payload`, null), valueTopic)
        )
      }
      if (minTopic) {
        values[minTopic.topicFilter] = parseFloat(
          this.getValueByTopic(get(this.value, `['${minTopic.topicFilter}'].payload`, null), minTopic)
        )
      }
      if (maxTopic) {
        values[maxTopic.topicFilter] = parseFloat(
          this.getValueByTopic(get(this.value, `['${maxTopic.topicFilter}'].payload`, null), maxTopic)
        )
      }
      return values
    },
    currentValueText () {
      return `${this.currentValue}${this.item.settings.units}`
    },
    currentValue: {
      get () {
        const topic = get(this.item, 'dataTopics[0].topicFilter')
        const value = get(this.valuesBySettings, `['${topic}']`, 'N/A')
        return value
      },
      set (val) {
        this.actionHandler(val)
      }
    },
    isValueValid () {
      return typeof this.currentValue === 'number' && !Number.isNaN(this.currentValue)
    },
    stringLength () {
      return this.currentValueText.length + this.item.settings.units.length
    },
    maxValue () {
      return this.item.settings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.maxValue
        : this.item.settings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE
          ? this.valuesBySettings[get(this.item, 'settings.topics[1].topicFilter')]
          : this.valuesBySettings[get(this.item, 'settings.topics[0].topicFilter')]
    },
    minValue () {
      return this.item.settings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.minValue
        : this.valuesBySettings[get(this.item, 'settings.topics[0].topicFilter')]
    }
  },
  mixins: [getValueByTopic]
}
</script>
