<template>
  <div v-if="mini" style="text-align: center;">
    <div
      style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;"
      :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]"
    >
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        {{`${currentLabel}`}}
      </div>
      <q-tooltip ref="tooltip">
        {{`${currentLabel} (${currentValue})`}}
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-list v-else style="height: 100%; overflow: auto;">
    <template v-if="item.settings.items.length">
      <q-item tag="label" v-for="(listItem, index) in item.settings.items" :key="`${index}${listItem.value}`" class="q-pa-none q-mb-xs">
        <q-item-section avatar>
          <q-radio v-model="currentValue" :val="listItem.val" :color="`${item.color}-7`" />
        </q-item-section>
        <q-item-section class="cursor-pointer">
          <q-item-label>{{listItem.label || listItem.val || 'Empty'}}</q-item-label>
          <q-item-label v-if="item.settings.mode === COMMAND_MODE" caption>{{listItem.actionTopic}}</q-item-label>
          <q-item-label v-if="item.settings.mode === COMMAND_MODE" caption>({{listItem.actionPayload || '*Empty*'}})</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <div v-else class="text-italic text-bold text-center" :class="[`text-${item.color}-8`]">No items</div>
  </q-list>
</template>

<script>
import JSONPath from 'jsonpath'
import get from 'lodash/get'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
export default {
  name: 'Singleselect',
  props: ['item', 'index', 'value', 'mini', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      DEFAULT_MODE,
      COMMAND_MODE,
      actionTopic: null,
      actionPayload: ''
    }
  },
  computed: {
    currentLabel () {
      const activeVal = this.item.settings.items.filter(item => item.val === this.currentValue)[0]
      return activeVal ? activeVal.label : 'N/A'
    },
    stringLength () {
      return this.currentLabel.length
    },
    currentValue: {
      get () {
        const topic = get(this.item, 'dataTopics[0].topicFilter')
        const value = this.getValueByTopic(get(this.value, `[${topic}].payload`, null), this.item.dataTopics[0])
        return value
      },
      set (val) {
        this.setAction(val)
        this.actionHandler()
      }
    }
  },
  methods: {
    setAction (val) {
      let topic = '',
        payload = ''
      if (this.item.settings.mode === DEFAULT_MODE) {
        topic = get(this.item, 'dataTopics[0].topicFilter')
        payload = val
        const payloadField = get(this.item, 'dataTopics[0].payloadField')
        if (payloadField) {
          payload = this.getCleanValue(get(this.value, `[${topic}].payload`, null), this.item.dataTopics[0])
          if (payload !== 'N/A') {
            JSONPath.apply(payload, payloadField, () => val)
            payload = JSON.stringify(payload)
          }
        }
      } else {
        const currentItem = this.item.settings.items.filter(item => item.val === val)[0]
        topic = currentItem.actionTopic
        payload = currentItem.actionPayload
      }
      this.actionTopic = topic
      this.actionPayload = payload
    },
    actionHandler () {
      if (this.actionTopic !== null) {
        const data = { topic: this.actionTopic, payload: this.actionPayload, settings: { retain: this.item.settings.save } }
        this.$emit('action', data)
      }
    }
  },
  mixins: [getValueByTopic]
}
</script>
