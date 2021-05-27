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
        :class="[`${currentValue === null ? 'disabled' : !actionTopic ? '' : 'cursor-pointer'}`]"
      />
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__switcher q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <div>
            <q-btn size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
              <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
            </q-btn>
            <q-btn size="0.7rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
              <q-menu anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
                <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                  <q-btn v-close-popup v-if="item.settings.width === 1" size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
                    <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
                  </q-btn>
                  <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                    <q-tooltip>Duplicate</q-tooltip>
                  </q-btn>
                  <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                  <q-btn v-close-popup size="0.7rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
                </div>
              </q-menu>
            </q-btn>
          </div>
        </q-item-section>
      </transition>
    </q-item>
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <q-icon
        @click.native.stop="actionHandler"
        size="3.8rem"
        :style="{color}"
        :name="currentValue ? `mdi-${item.settings.trueIcon || 'toggle-switch-outline'}` : `mdi-${item.settings.falseIcon || 'toggle-switch-off-outline'}`"
        style="width: 100%; height: 100%;"
        :class="[`${currentValue === null ? 'disabled' : isActiveWidget ? 'cursor-pointer' : ''}`]"
      />
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px; bottom: 1px; left: 1px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
</template>

<style lang="stylus">
.block-leave-to
  transition all .2s ease-in-out
  opacity 0
.block-leave
  transition all .2s ease-in-out
  opacity 1
.block-enter
  transition all .2s ease-in-out
  opacity 0
.block-enter-to
  transition all .2s ease-in-out
  opacity 1
</style>

<script>
import JSONPath from 'jsonpath'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE, ACCUMULATE_AND_MODE, ACCUMULATE_OR_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'Switcher',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
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
    currentValue () {
      const mode = this.item.settings.accumulateLogic
      const initValue = mode === ACCUMULATE_AND_MODE
      const trueValue = this.item.settings.trueValue
      const falseValue = this.item.settings.falseValue
      return this.item.dataTopics.reduce((result, topicObj) => {
        if (result === null) { return result }
        const value = this.value[topicObj.topicFilter] !== null
          ? this.mathProcessing(this.getValueByTopic(this.value[topicObj.topicFilter].payload, topicObj), this.item.settings.math)
          : this.value[topicObj.topicFilter]
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
    },
    contentHeight () {
      let height = 'calc(100% - 22px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 4px)'
      }
      return height
    }
  },
  methods: {
    getValue () {
      let value = ''
      if (this.item.settings.mode === COMMAND_MODE) {
        value = this.currentValue ? this.item.settings.falsePayload : this.item.settings.truePayload
      } else {
        value = this.item.dataTopics.reduce((result, topicObj) => {
          const value = this.value[topicObj.topicFilter] !== null
            ? this.getValueByTopic(this.value[topicObj.topicFilter].payload, topicObj)
            : this.value[topicObj.topicFilter]
          return (value === this.item.settings.trueValue) && (result === this.item.settings.trueValue)
            ? this.item.settings.falseValue : (value === this.item.settings.falseValue) && (result === this.item.settings.falseValue)
              ? this.item.settings.trueValue : value
                ? this.item.settings.falseValue : this.item.settings.trueValue
        }, this.item.settings.falseValue)
      }
      return value
    },
    actionHandler () {
      if (this.currentValue !== null && this.isActiveWidget) {
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
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
