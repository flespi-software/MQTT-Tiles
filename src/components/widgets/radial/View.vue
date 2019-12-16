<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${currentValueText !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        {{`${currentValueText}${item.settings.units}`}}
      </div>
      <q-tooltip ref="tooltip">
        {{`${currentValueText}${item.settings.units}`}}
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__radial absolute" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
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
    <q-card-section class="widget__content q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div style="width: 100%; height: 100%;">
        <div class="radial__payload" style="height: 100%">
          <q-resize-observer @resize="onResize" />
          <radial-gauge :options="options" :value="currentValue"/>
        </div>
      </div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus">
  .radial__payload
    font-size 1.2rem
    word-break break-all
    overflow auto
    width 100%
    display block
    // padding 2px 4px
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
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
import RadialGauge from './RadialGauge'
export default {
  name: 'Radial',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      width: 0,
      height: 0,
      colors: {
        plate: {
          'grey': '#bdbdbd',
          'red': '#e57373',
          'green': '#81c784',
          'orange': '#ffb74d',
          'blue': '#64b5f6',
          'light-blue': '#4fc3f7',
          'purple': '#ba68c8',
          'deep-orange': '#ff8a65',
          'cyan': '#4dd0e1',
          'brown': '#a1887f',
          'blue-grey': '#90a4ae'
        },
        borderOuter: {
          'grey': '#fafafa',
          'red': '#ffebee',
          'green': '#e8f5e9',
          'orange': '#fff3e0',
          'blue': '#e3f2fd',
          'light-blue': '#e1f5fe',
          'purple': '#f3e5f5',
          'deep-orange': '#fbe9e7',
          'cyan': '#e0f7fa',
          'brown': '#efebe9',
          'blue-grey': '#eceff1'
        },
        borderMiddle: {
          'grey': '#f5f5f5',
          'red': '#ffcdd2',
          'green': '#c8e6c9',
          'orange': '#ffe0b2',
          'blue': '#bbdefb',
          'light-blue': '#b3e5fc',
          'purple': '#f3e5f5',
          'deep-orange': '#ffccbc',
          'cyan': '#b2ebf2',
          'brown': '#d7ccc8',
          'blue-grey': '#cfd8dc'
        },
        borderInner: {
          'grey': '#eee',
          'red': '#ef9a9a',
          'green': '#a5d6a7',
          'orange': '#ffcc80',
          'blue': '#90caf9',
          'light-blue': '#81d4fa',
          'purple': '#e1bee7',
          'deep-orange': '#ffab91',
          'cyan': '#80deea',
          'brown': '#bcaaa4',
          'blue-grey': '#b0bec5'
        }
      }
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    onResize ({ width, height }) {
      this.width = width
      this.height = height
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
      return this.valuesBySettings[this.item.dataTopics[0].topicFilter]
    },
    currentValue () {
      let value = this.valuesBySettings[this.item.dataTopics[0].topicFilter]
      return Number.isNaN(value) ? 0 : this.mathProcessing(value, this.item.settings.math)
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
    options () {
      let settings = this.item.settings,
        getMajorTicks = (settings) => {
          let step = (this.maxValue - this.minValue) / 10
          return new Array(11).fill(0).reduce((values, _, index, arr) => {
            if (index === 0) {
              values.push(this.minValue)
            } else if (index === arr.length - 1) {
              values.push(this.maxValue)
            } else {
              let value = Math.round((values[values.length - 1] + step) * 100) / 100
              if (Number.isNaN(value)) {
                value = 'N/A'
              }
              values.push(value)
            }
            return values
          }, [])
        }
      return {
        valueText: this.currentValueText,
        minValue: this.minValue,
        maxValue: this.maxValue,
        width: this.width - 16,
        height: this.height - 16,
        majorTicks: getMajorTicks(settings),
        units: settings.units,
        animation: true,
        animationRule: 'linear',
        animationDuration: 300,
        colorPlate: this.colors.plate[this.item.color],
        colorBorderOuter: this.colors.borderOuter[this.item.color],
        colorBorderOuterEnd: this.colors.borderOuter[this.item.color],
        colorBorderMiddle: this.colors.borderMiddle[this.item.color],
        colorBorderMiddleEnd: this.colors.borderMiddle[this.item.color],
        colorBorderInner: this.colors.borderInner[this.item.color],
        colorBorderInnerEnd: this.colors.borderInner[this.item.color],
        borderShadowWidth: 1,
        colorNeedleShadowDown: '#222',
        colorNeedle: '#d32f2f',
        colorNeedleEnd: '#d32f2f',
        colorUnits: '#616161',
        highlights: [
          { 'from': this.minValue, 'to': settings.lowLevel, 'color': 'rgba(165,214,167,1)' },
          { 'from': settings.lowLevel, 'to': settings.midLevel, 'color': 'rgba(220,231,117,1)' },
          { 'from': settings.midLevel, 'to': settings.highLevel, 'color': 'rgba(255,179,0,1)' },
          { 'from': settings.highLevel, 'to': this.maxValue, 'color': 'rgba(244,81,30,1)' }
        ]
      }
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 11px)'
      }
      return height
    }
  },
  components: { RadialGauge },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
