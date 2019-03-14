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
  <q-card flat v-else inline class="widget__linear" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 29px;">
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
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 29px);">
      <div style="width: 100%; height: 100%;">
        <div class="linear__payload" style="height: 100%">
          <q-resize-observable @resize="onResize" />
          <linear-gauge :options="options" :value="currentValue"/>
        </div>
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .linear__payload
    font-size 1.2rem
    word-break break-all
    overflow auto
    width 100%
    display block
    padding 2px 4px
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
  WIDGET_PAYLOAD_TYPE_NUMBER,
  WIDGET_PAYLOAD_TYPE_JSON,
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
import LinearGauge from './LinearGuage'
export default {
  name: 'Linear',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      width: 0,
      height: 0,
      colors: {
        border: {
          'grey': '#fafafa',
          'red': '#ffebee',
          'green': '#e8f5e9',
          'orange': '#fff3e0',
          'blue': '#e3f2fd',
          'light-blue': '#e1f5fe'
        },
        barColorsProgress: {
          'grey': '#bdbdbd',
          'red': '#e57373',
          'green': '#81c784',
          'orange': '#ffb74d',
          'blue': '#64b5f6',
          'light-blue': '#4fc3f7'
        },
        barColors: {
          'grey': '#f5f5f5',
          'red': '#ffcdd2',
          'green': '#c8e6c9',
          'orange': '#ffe0b2',
          'blue': '#bbdefb',
          'light-blue': '#b3e5fc'
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
    getValueBySettings (value) {
      if (value === null) {
        value = 'N/A'
      } else {
        switch (this.item.settings.payloadType) {
          case WIDGET_PAYLOAD_TYPE_NUMBER: {
            value = parseFloat(value)
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            if (this.item.settings.payloadField) {
              value = JSON.parse(value.toString())[this.item.settings.payloadField] || 'N/A'
            } else {
              value = JSON.parse(value.toString())
            }
            break
          }
          default: { value = value.toString() }
        }
      }
      return value
    },
    onResize ({width, height}) {
      this.width = width
      this.height = height
    }
  },
  computed: {
    valuesBySettings () {
      return Object.keys(this.value).reduce((values, topic) => {
        values[topic] = this.getValueBySettings(this.value[topic])
        return values
      }, {})
    },
    currentValueText () {
      return this.valuesBySettings[this.item.topics[0]]
    },
    currentValue () {
      let value = parseFloat(this.value[this.item.topics[0]])
      return Number.isNaN(value) ? 0 : value
    },
    stringLength () {
      return this.currentValueText.length + this.item.settings.units.length
    },
    maxValue () {
      return this.item.settings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.maxValue
        : this.item.settings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE
          ? this.valuesBySettings[this.item.settings.topics[1]]
          : this.valuesBySettings[this.item.settings.topics[0]]
    },
    minValue () {
      return this.item.settings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
        ? this.item.settings.minValue
        : this.valuesBySettings[this.item.settings.topics[0]]
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
              let value = Math.round(values[values.length - 1] + step)
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
        colorPlate: this.colors.border[this.item.color],
        colorBorderOuter: this.colors.border[this.item.color],
        colorBorderOuterEnd: this.colors.border[this.item.color],
        colorBorderMiddle: this.colors.border[this.item.color],
        colorBorderMiddleEnd: this.colors.border[this.item.color],
        colorBorderInner: this.colors.border[this.item.color],
        colorBorderInnerEnd: this.colors.border[this.item.color],
        borderShadowWidth: 0,
        colorNeedleShadowDown: '#222',
        colorNeedle: '#d32f2f',
        colorNeedleEnd: '#d32f2f',
        colorUnits: '#616161',
        barWidth: 8,
        colorBarProgress: this.colors.barColorsProgress[this.item.color],
        colorBar: this.colors.barColors[this.item.color],
        highlights: [
          { 'from': this.minValue, 'to': settings.lowLevel, 'color': 'rgba(79,195,247,1)' },
          { 'from': settings.lowLevel, 'to': settings.midLevel, 'color': 'rgba(165,214,167,1)' },
          { 'from': settings.midLevel, 'to': settings.highLevel, 'color': 'rgba(255,179,0,1)' },
          { 'from': settings.highLevel, 'to': this.maxValue, 'color': 'rgba(244,81,30,1)' }
        ]
      }
    }
  },
  components: { LinearGauge }
}
</script>
