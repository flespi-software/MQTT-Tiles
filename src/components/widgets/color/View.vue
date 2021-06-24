<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${!disable ? `${item.color}-1` : 'grey-3'}`]">
      <div style="border-radius: 50%; height: 80%; width: 80%; display: inline-block; vertical-align: middle;" :style="{backgroundColor: miniColor }">
      </div>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else class="color__payload-wrapper flex flex-center">
    <color-picker v-if="item.settings.mode === COLOR_MODE_SIMPLE" :hue="color.h" @input="actionHandler" :disabled="disable"/>
    <q-color
      v-else
      :class="[`bg-${item.color}-1`]"
      style="border: none;"
      :disable="disable"
      :value="color"
      @input="actionHandler"
      :readonly="item.dataTopics[0] && !!item.dataTopics[0].topicField"
      default-value="#FFF"
    />
  </div>
</template>

<style lang="stylus">
  .color__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
    height 100%
  .color__payload
    padding 2px 4px
</style>

<script>
import get from 'lodash/get'
import JSONPath from 'jsonpath'
import ColorPicker from '@radial-color-picker/vue-color-picker'
import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import { colors } from 'quasar'
import debounce from 'lodash/debounce'
const { rgbToHex, rgbToHsv, hexToRgb, hsvToRgb } = colors
import {
  COLOR_FORMAT_HEX,
  COLOR_FORMAT_RGB,
  COLOR_FORMAT_HSV,
  COLOR_MODE_SIMPLE,
  COLOR_MODE_FULL
} from './constants'
export default {
  name: 'Color',
  props: ['item', 'index', 'mini', 'value'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      COLOR_FORMAT_HEX,
      COLOR_FORMAT_RGB,
      COLOR_FORMAT_HSV,
      COLOR_MODE_SIMPLE,
      COLOR_MODE_FULL,
      disable: false
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    toggleStatus (status) {
      this.disable = status
      return status
    },
    getObjByTemplate (color, template) {
      let colorObj = {}
      const names = []
      template = template.replace(/\{|\}|\[|\]|\(|\)/g, (match) => `\\${match}`)
      template = new RegExp(template.replace(/%[hex|r|g|b|h|s|v|a]{1,3}%/g, (match) => {
        names.push(match.slice(1, -1))
        return '([.#A-Za-z0-9]+)'
      }))
      try {
        let values = color.match(template)
        values = values.slice(1)
        names.forEach((name, index) => {
          if (this.item.settings.format === COLOR_FORMAT_HEX && name === 'hex') {
            colorObj[name] = values[index] === undefined ? '#ffffff' : values[index]
          } else {
            colorObj[name] = values[index] === undefined ? 100 : parseInt(values[index])
          }
        })
        if (this.item.settings.format === COLOR_FORMAT_HEX) {
          colorObj = colorObj.hex
        }
        return colorObj
      } catch (e) {
        names.forEach((name, index) => {
          colorObj[name] = 100
        })
        return colorObj
      }
    },
    getModelColor (color) {
      this.toggleStatus(color === 'N/A')
      if (this.item.settings.valueTemplate) {
        color = this.getObjByTemplate(color, this.item.settings.valueTemplate)
      } else {
        try {
          color = JSON.parse(color)
        } catch (e) {}
      }
      switch (this.item.settings.format) {
        case COLOR_FORMAT_HEX: {
          if (this.item.settings.mode === COLOR_MODE_SIMPLE) {
            color = typeof color === 'string' && color.indexOf('#') === 0 ? color : `#${color}`
            color = rgbToHsv(hexToRgb(color))
          } else {
            color = hexToRgb(typeof color === 'string' ? color : '#ffffff')
            color = `rgb(${color.r},${color.g},${color.b})`
          }
          break
        }
        case COLOR_FORMAT_RGB: {
          if (this.item.settings.mode === COLOR_MODE_SIMPLE) {
            color = rgbToHsv(color)
          } else {
            const isHex = typeof color === 'string' && color.indexOf('#') === 0
            const isHsv = typeof color === 'object' && color.h !== undefined && color.s !== undefined && color.v !== undefined
            color = isHex ? hexToRgb(color) : isHsv ? hsvToRgb(color) : color
            color = `rgb(${color.r},${color.g},${color.b})`
          }
          break
        }
        case COLOR_FORMAT_HSV: {
          if (this.item.settings.mode === COLOR_MODE_FULL) {
            color = hsvToRgb(color)
            color = `rgb(${color.r},${color.g},${color.b})`
          }
          break
        }
      }
      return color
    },
    getRGBObj (str) {
      const match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
      return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : { r: 0, g: 0, b: 0 }
    },
    getActionColor (color) {
      if (this.item.settings.mode === COLOR_MODE_SIMPLE) {
        color = { h: color, s: 100, v: 100, a: 100 }
        switch (this.item.settings.format) {
          case COLOR_FORMAT_HEX: {
            color = rgbToHex(hsvToRgb(color))
            break
          }
          case COLOR_FORMAT_RGB: {
            color = hsvToRgb(color)
            break
          }
          case COLOR_FORMAT_HSV: {
            break
          }
        }
      } else {
        color = this.getRGBObj(color)
        if (this.item.settings.format === COLOR_FORMAT_HSV) {
          color = rgbToHsv(color)
        } else if (this.item.settings.format === COLOR_FORMAT_HEX) {
          color = rgbToHex(color)
        }
      }
      if (this.item.settings.valueTemplate) {
        color = this.item.settings.valueTemplate.replace(/%[hex|r|g|b|h|s|v|a]{1,3}%/g, (match) => {
          const name = match.slice(1, -1)
          return color[name] === undefined ? (color || '') : color[name]
        })
      }
      if (this.item.settings.publishTemplate) {
        color = this.item.settings.publishTemplate.replace('%value%', JSON.stringify(color))
      }
      return color
    }
  },
  computed: {
    topic () {
      return get(this.item, 'dataTopics[0].topicFilter')
    },
    colorValue () {
      const value = get(this.value, `['${this.topic}'].payload`, null)
      return this.getValueByTopic(value, this.item.dataTopics[0])
    },
    color () {
      return this.getModelColor(this.colorValue)
    },
    miniColor () {
      let color = this.color
      if (typeof color === 'string') {
        return color
      } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a === undefined ? 100 : color.a})`
      } else {
        color = hsvToRgb(color)
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a === undefined ? 100 : color.a})`
      }
    }
  },
  created () {
    this.actionHandler = debounce((color) => {
      const topic = get(this.item, 'dataTopics[0]')
      color = this.getActionColor(color)
      const topicFilter = topic.topicFilter
      const payloadField = topic.payloadField
      let payload = color
      if (payloadField) {
        payload = this.getCleanValue(this.value[topicFilter] && this.value[topicFilter].payload, topic)
        if (payload !== 'N/A') {
          JSONPath.apply(payload, payloadField, () => color)
          payload = JSON.stringify(payload)
        }
      } else if (typeof color === 'object') {
        payload = JSON.stringify(color)
      }
      const data = { topic: topicFilter, payload, settings: { retain: this.item.settings.save } }
      this.$emit('action', data)
    }, 300)
  },
  components: { ColorPicker },
  mixins: [getValueByTopic]
}
</script>
