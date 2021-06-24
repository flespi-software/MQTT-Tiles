<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div
      style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;"
      :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]"
    >
      <q-icon
        size="3rem"
        :color="item.currentValue === null ? 'grey-4' : currentValue ? `${item.color}-7` : `grey-6`"
        :name="currentValue ? `mdi-${item.settings.trueIcon || 'toggle-switch-outline'}` : `mdi-${item.settings.falseIcon || 'toggle-switch-off-outline'}`"
        :class="controlClasses"
      />
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-icon
    v-else
    @click.native.stop="actionHandler"
    size="3.8rem"
    :style="{color}"
    :name="currentValue ? `mdi-${item.settings.trueIcon || 'toggle-switch-outline'}` : `mdi-${item.settings.falseIcon || 'toggle-switch-off-outline'}`"
    style="width: 100%; height: 100%;"
    :class="controlClasses"
  />
</template>

<script>
import get from 'lodash/get'
import JSONPath from 'jsonpath'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE, ACCUMULATE_AND_MODE, ACCUMULATE_OR_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
export default {
  name: 'Switcher',
  props: ['item', 'index', 'value', 'mini', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    color () {
      let color = '#e0e0e0e'
      if (this.currentValue !== null) {
        if (this.currentValue) {
          color = this.item.settings.trueColor
        } else {
          color = this.item.settings.falseColor
        }
      }
      return color
    },
    controlClasses () {
      const classes = []
      if (this.currentValue === null) {
        classes.push('disabled')
      } else if (this.isActiveWidget) {
        classes.push('cursor-pointer')
      }
      return classes
    },
    currentValue () {
      const mode = this.item.settings.accumulateLogic
      const initValue = mode === ACCUMULATE_AND_MODE
      const trueValue = this.item.settings.trueValue
      const falseValue = this.item.settings.falseValue
      return this.item.dataTopics.reduce((result, topicObj, index, topics) => {
        if (result === null) { return result }
        let value = get(this.value, `['${topicObj.topicFilter}'].payload`, null)
        if (value !== null || (topics.length === 1 && topicObj.default)) {
          value = this.mathProcessing(this.getValueByTopic(value, topicObj), this.item.settings.math)
        }
        switch (mode) {
          case ACCUMULATE_AND_MODE: {
            result = value === trueValue
              ? result && true : value === falseValue
                ? result && false : null
            break
          }
          case ACCUMULATE_OR_MODE: {
            result = value === trueValue
              ? result || true : value === falseValue
                ? result || false : null
            break
          }
        }
        return result
      }, initValue)
    },
    actionTopic () {
      let topic = null
      if (this.currentValue === null) {
        topic = null
      } else if (this.item.settings.mode === COMMAND_MODE) {
        topic = this.currentValue ? this.item.settings.falseActionTopic : this.item.settings.trueActionTopic
      } else if (this.item.topics.length === 1) {
        topic = this.item.topics[0]
      } else if (this.item.settings.mode === DEFAULT_MODE) {
        topic = this.item.settings.actionTopic
      }
      return topic
    },
    isActiveWidget () {
      return !!this.actionTopic && ((this.item.settings.mode === COMMAND_MODE) || (!this.item.settings.math && this.item.settings.mode === DEFAULT_MODE))
    }
  },
  methods: {
    getValue () {
      let value = ''
      if (this.item.settings.mode === COMMAND_MODE) {
        value = this.currentValue ? this.item.settings.falsePayload : this.item.settings.truePayload
      } else {
        value = this.item.dataTopics.reduce((result, topicObj, index, topics) => {
          let value = get(this.value, `['${topicObj.topicFilter}'].payload`, null)
          if (value !== null || (topics.length === 1 && topicObj.default)) {
            value = this.mathProcessing(this.getValueByTopic(value, topicObj), this.item.settings.math)
          }
          return (value === this.item.settings.trueValue) && (result === this.item.settings.trueValue)
            ? this.item.settings.falseValue : (value === this.item.settings.falseValue) && (result === this.item.settings.falseValue)
              ? this.item.settings.trueValue : value
                ? this.item.settings.falseValue : this.item.settings.trueValue
        }, this.item.settings.falseValue)
      }
      return value
    },
    actionHandler () {
      if (this.isActiveWidget) {
        const val = this.getValue()
        const topic = this.actionTopic
        let payload = val
        const firstDataTopic = this.item.dataTopics[0]
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
  mixins: [getValueByTopic, formatValue]
}
</script>
