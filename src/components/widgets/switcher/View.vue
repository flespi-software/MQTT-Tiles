<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div
      style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;"
      :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]"
    >
      <q-icon
        size="3rem"
        :color="item.currentValue === null ? 'grey-4' : currentValue ? `${item.color}-7` : `grey-6`"
        :name="currentValue ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        :class="[`${currentValue === null ? 'disabled' : !actionTopic ? '' : 'cursor-pointer'}`]"
      />
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__switcher q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none" style="min-height: 22px;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
            <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
          </q-btn>
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                <q-btn v-close-overlay v-if="item.settings.width === 1" size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
                  <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Duplicate</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
              </div>
            </q-popover>
          </q-btn>
        </q-item-side>
      </transition>
    </q-item>
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 22px);">
      <q-icon
        @click.native.stop="actionHandler"
        size="3.8rem"
        :color="item.currentValue === null ? 'grey-4' : currentValue ? `${item.color}-7` : `grey-6`"
        :name="currentValue ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        style="width: 100%; height: 100%;"
        :class="[`${currentValue === null ? 'disabled' : actionTopic ? 'cursor-pointer' : ''}`]"
      />
    </q-card-media>
    <div class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
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
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE, ACCUMULATE_AND_MODE, ACCUMULATE_OR_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
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
    currentValue () {
      let mode = this.item.settings.accumulateLogic
      let initValue = mode === ACCUMULATE_AND_MODE
      return this.item.dataTopics.reduce((result, topicObj) => {
        if (result === null) { return result }
        let value = this.value[topicObj.topicFilter] !== null
          ? this.getValueByTopic(this.value[topicObj.topicFilter].payload, topicObj)
          : this.value[topicObj.topicFilter]
        switch (mode) {
          case ACCUMULATE_AND_MODE: {
            result = value === this.item.settings.trueValue
              ? result && true : value === this.item.settings.falseValue
                ? result && false : null
            break
          }
          case ACCUMULATE_OR_MODE: {
            result = value === this.item.settings.trueValue
              ? result || true : value === this.item.settings.falseValue
                ? result || false : null
            break
          }
        }
        return result
      }, initValue)
    },
    actionTopic () {
      if (this.currentValue === null) {
        return null
      } else if (this.item.settings.mode === COMMAND_MODE) {
        return this.currentValue ? this.item.settings.falseActionTopic : this.item.settings.trueActionTopic
      } else if (this.item.topics.length === 1) {
        return this.item.topics[0]
      } else if (this.item.settings.mode === DEFAULT_MODE) {
        return this.item.settings.actionTopic
      }
    }
  },
  methods: {
    getValue () {
      if (this.item.settings.mode === COMMAND_MODE) {
        return this.currentValue ? this.item.settings.falsePayload : this.item.settings.truePayload
      } else {
        return this.item.dataTopics.reduce((result, topicObj) => {
          let value = this.value[topicObj.topicFilter] !== null
            ? this.getValueByTopic(this.value[topicObj.topicFilter].payload, topicObj)
            : this.value[topicObj.topicFilter]
          return (value === this.item.settings.trueValue) && (result === this.item.settings.trueValue)
            ? this.item.settings.falseValue : (value === this.item.settings.falseValue) && (result === this.item.settings.falseValue)
              ? this.item.settings.trueValue : value
                ? this.item.settings.falseValue : this.item.settings.trueValue
        }, this.item.settings.falseValue)
      }
    },
    actionHandler () {
      if (this.currentValue !== null && this.actionTopic) {
        let data = {topic: this.actionTopic, payload: this.getValue(), settings: {retain: this.item.settings.save}}
        this.$emit('action', data)
      }
    }
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
