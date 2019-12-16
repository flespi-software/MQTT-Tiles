<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${!disable ? `${item.color}-1` : 'grey-3'}`]">
      <div style="border-radius: 50%; height: 80%; width: 80%; display: inline-block; vertical-align: middle;" :style="{backgroundColor: miniColor }">
      </div>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__color" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
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
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div class="color__payload-wrapper flex flex-center">
        <color-picker v-if="item.settings.mode === COLOR_MODE_SIMPLE" :hue="color.h" @input="actionHandler" :disabled="disable"/>
        <q-color
          v-else
          :class="[`bg-${item.color}-1`]"
          style="border: none;"
          :disable="disable"
          :value="color"
          @input="actionHandler"
          :readonly="!!item.dataTopics[0].topicField"
          default-value="#FFF"
        />
      </div>
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px; bottom: 1px; left: 1px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
</template>

<style lang="stylus">
  .color__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
    height 100%
  .color__payload
    padding 2px 4px
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
import ColorPicker from '@radial-color-picker/vue-color-picker'
import '@radial-color-picker/vue-color-picker/dist/vue-color-picker.min.css'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
import { debounce, colors } from 'quasar'
const { rgbToHex, rgbToHsv, hexToRgb, hsvToRgb } = colors
import {
  COLOR_FORMAT_HEX,
  COLOR_FORMAT_RGB,
  COLOR_FORMAT_HSV,
  COLOR_MODE_SIMPLE,
  COLOR_MODE_FULL
} from './constants'
let debouncedAction = debounce((ctx, color) => {
  if (typeof color === 'object') {
    color = JSON.stringify(color)
  }
  let data = { topic: ctx.item.dataTopics[0].topicFilter, payload: color, settings: { retain: ctx.item.settings.save } }
  ctx.$emit('action', data)
}, 300)
export default {
  name: 'Color',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
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
    actionHandler (color) { debouncedAction(this, this.getActionColor(color)) },
    getObjByTemplate (color, template) {
      let colorObj = {}
      let names = []
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
            let isHex = typeof color === 'string' && color.indexOf('#') === 0
            let isHsv = typeof color === 'object' && color.h !== undefined && color.s !== undefined && color.v !== undefined
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
      let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
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
          let name = match.slice(1, -1)
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
      return this.item.dataTopics[0].topicFilter
    },
    colorValue () {
      return this.getValueByTopic(this.value[this.topic] && this.value[this.topic].payload, this.item.dataTopics[0])
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
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 24px)' }
      return height
    }
  },
  components: { ColorPicker },
  mixins: [getValueByTopic, timestamp]
}
</script>
