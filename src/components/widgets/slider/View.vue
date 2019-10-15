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
  <q-card flat v-else inline class="widget__slider absolute" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
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
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div style="width: 100%; height: 100%;">
        <div class="slider__payload q-px-md flex flex-center" style="height: 100%">
          <div style="width: 100%">
            <q-slider
              :value="currentValue"
              @change="actionHandler"
              :color="`${item.color}-7`"
              :min="minValue"
              :max="maxValue"
              :step="item.settings.step"
            />
            <div :class="[`text-${item.color}-7`, 'text-bold']">{{currentValueText}}</div>
          </div>
        </div>
      </div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .slider__payload
    font-size 1.2rem
    word-break break-all
    width 100%
    text-align center
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
import {
  WIDGET_STATUS_DISABLED,
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'Slider',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
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
      let data = {topic: this.item.dataTopics[0].topicFilter, payload: `${val}`, settings: {retain: this.item.settings.save}}
      this.$emit('action', data)
    }
  },
  computed: {
    valuesBySettings () {
      let valueTopic = this.item.dataTopics[0],
        minTopic = this.item.settings.topics[0],
        maxTopic = this.item.settings.topics[1],
        values = {
          [valueTopic.topicFilter]: parseFloat(this.getValueByTopic(this.value[valueTopic.topicFilter] && this.value[valueTopic.topicFilter].payload, valueTopic))
        }
      if (minTopic) {
        values[minTopic.topicFilter] = parseFloat(this.getValueByTopic(this.value[minTopic.topicFilter] && this.value[minTopic.topicFilter].payload, minTopic))
      }
      if (maxTopic) {
        values[maxTopic.topicFilter] = parseFloat(this.getValueByTopic(this.value[maxTopic.topicFilter] && this.value[maxTopic.topicFilter].payload, maxTopic))
      }
      return values
    },
    currentValueText () {
      return `${this.valuesBySettings[this.item.dataTopics[0].topicFilter]}${this.item.settings.units}`
    },
    currentValue: {
      get () {
        let value = this.valuesBySettings[this.item.dataTopics[0].topicFilter]
        return Number.isNaN(value) ? 0 : value
      },
      set (val) {
        this.actionHandler(val)
      }
    },
    stringLength () {
      return this.currentValueText.length + this.item.settings.units.length
    },
    maxValue () {
      return this.item.settings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.maxValue
        : this.item.settings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE
          ? this.valuesBySettings[this.item.settings.topics[1].topicFilter]
          : this.valuesBySettings[this.item.settings.topics[0].topicFilter]
    },
    minValue () {
      return this.item.settings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.minValue
        : this.valuesBySettings[this.item.settings.topics[0].topicFilter]
    },
    contentHeight () {
      let height = 'calc(100% - 29px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 11px)'
      }
      return height
    }
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
