<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${currentValueText !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        {{`${currentValue}${item.settings.units}`}}
      </div>
      <q-tooltip ref="tooltip">
        {{`${currentValue}${item.settings.units}`}}
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else style="width: 100%; height: 100%;">
    <div class="linear__payload" style="height: 100%">
      <q-resize-observer @resize="onResize" />
      <linear-gauge :options="options" :value="currentValue"/>
    </div>
  </div>
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
</style>

<script>
import {
  WIDGET_STATUS_DISABLED,
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
import get from 'lodash/get'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import LinearGauge from './LinearGauge'
export default {
  name: 'Linear',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      width: 0,
      height: 0,
      colors: {
        border: {
          grey: '#fafafa',
          red: '#ffebee',
          green: '#e8f5e9',
          orange: '#fff3e0',
          blue: '#e3f2fd',
          'light-blue': '#e1f5fe',
          purple: '#f3e5f5',
          'deep-orange': '#fbe9e7',
          cyan: '#e0f7fa',
          brown: '#efebe9',
          'blue-grey': '#eceff1'
        },
        barColorsProgress: {
          grey: '#bdbdbd',
          red: '#e57373',
          green: '#81c784',
          orange: '#ffb74d',
          blue: '#64b5f6',
          'light-blue': '#4fc3f7',
          purple: '#ba68c8',
          'deep-orange': '#ff8a65',
          cyan: '#4dd0e1',
          brown: '#a1887f',
          'blue-grey': '#90a4ae'
        },
        barColors: {
          grey: '#f5f5f5',
          red: '#ffcdd2',
          green: '#c8e6c9',
          orange: '#ffe0b2',
          blue: '#bbdefb',
          'light-blue': '#b3e5fc',
          purple: '#e1bee7',
          'deep-orange': '#ffccbc',
          cyan: '#b2ebf2',
          brown: '#d7ccc8',
          'blue-grey': '#cfd8dc'
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
      const valueTopic = this.item.dataTopics[0],
        minTopic = this.item.settings.topics[0],
        maxTopic = this.item.settings.topics[1],
        values = {}
      if (valueTopic) {
        values[valueTopic.topicFilter] = parseFloat(this.getValueByTopic(get(this.value, `['${valueTopic.topicFilter}'].payload`, null), valueTopic))
      }
      if (minTopic) {
        values[minTopic.topicFilter] = parseFloat(this.getValueByTopic(get(this.value, `['${minTopic.topicFilter}'].payload`, null), minTopic))
      }
      if (maxTopic) {
        values[maxTopic.topicFilter] = parseFloat(this.getValueByTopic(get(this.value, `['${maxTopic.topicFilter}'].payload`, null), maxTopic))
      }
      return values
    },
    currentValueText () {
      const topic = get(this.item, 'dataTopics[0].topicFilter')
      const value = get(this.valuesBySettings, `['${topic}']`, 'N/A')
      return value
    },
    currentValue () {
      const topic = get(this.item, 'dataTopics[0].topicFilter')
      const value = get(this.valuesBySettings, `['${topic}']`, 'N/A')
      return typeof value !== 'number' || Number.isNaN(value) ? 0 : this.mathProcessing(value, this.item.settings.math)
    },
    stringLength () {
      return this.currentValue.length + this.item.settings.units.length
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
    },
    options () {
      const settings = this.item.settings,
        getMajorTicks = (settings) => {
          const step = (this.maxValue - this.minValue) / 10
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
        valueText: this.currentValue,
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
          { from: this.minValue, to: settings.lowLevel, color: 'rgba(79,195,247,1)' },
          { from: settings.lowLevel, to: settings.midLevel, color: 'rgba(165,214,167,1)' },
          { from: settings.midLevel, to: settings.highLevel, color: 'rgba(255,179,0,1)' },
          { from: settings.highLevel, to: this.maxValue, color: 'rgba(244,81,30,1)' }
        ]
      }
    }
  },
  components: { LinearGauge },
  mixins: [getValueByTopic, formatValue]
}
</script>
