<template>
  <q-card flat inline class="widget__multiplier q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none" style="min-height: 22px;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
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
    <q-card-media class="widget__content scroll" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 22px);">
      <div style="width: 100%; position: relative;">
        <div  v-for="(widget, widgetIndex) in widgets"
          :key="widgetIndex"
          style="display: inline-block; position: relative;"
          :style="{width: widgetsWidth, minHeight: `${50 * item.settings.widgetSettings.height}px`}"
          class="q-ma-sm"
        >
          <component
            class="wrapper__items"
            :is="item.settings.type"
            :item="widgets[widgetIndex]"
            :value="{[widgetIndex]: currentValue[widgetIndex]}"
            :index="widgetIndex"
            :blocked="true"
            @action="(data) => { $emit('action', data) }"
          />
        </div>
      </div>
    </q-card-media>
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
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import VueGridLayout from 'vue-grid-layout'
import Switcher from '../switcher/View'
import Informer from '../informer/View'
import Radial from '../radial/View'
import Linear from '../linear/View'
import Singleselect from '../singleselect/View'
export default {
  name: 'Multiplier',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      widgets: {},
      layout: []
    }
  },
  computed: {
    currentValue () {
      if (!this.value) { return {} }
      return this.value[Object.keys(this.value)[0]]
    },
    widgetsWidth () {
      let width = (this.item.settings.widgetSettings.width / this.item.settings.width) * 100
      if (width <= 33) {
        width = 33
      } else if (width <= 50) {
        width = 50
      } else {
        width = 100
      }
      if (this.$q.platform.is.mobile) {
        width = 100
      }
      return `calc(${width}% - 16px)`
    }
  },
  methods: {
    initWidget (name) {
      let widget = {
        name,
        id: name,
        color: this.item.settings.color,
        type: this.item.settings.type,
        topics: [name],
        dataTopics: [{payloadField: this.item.dataTopics[0].payloadField, payloadType: this.item.dataTopics[0].payloadType, topicFilter: name}], // topics for datasource
        settings: cloneDeep(this.item.settings.widgetSettings),
        status: WIDGET_STATUS_DISABLED
      }
      Vue.set(this.widgets, name, widget)
    },
    initWidgetInLayout (name) {
      let colNum = this.item.settings.width,
        layout = this.layout,
        {x, y} = freeSpace(),
        width = this.item.settings.widgetSettings.width,
        height = this.item.settings.widgetSettings.height
      function freeSpace () {
        let max = layout.reduce((max, widget) => {
          if ((max.y === widget.y && max.x <= widget.x) || max.y < widget.y) {
            max = widget
          }
          return max
        }, {y: 0, x: 0, h: 0, w: 0})
        if (max.x + max.w + width <= colNum) {
          // todo check if w > colNum => w = col.num
          return { x: max.x + max.w, y: max.y }
        } else {
          return { x: 0, y: max.y + 1 }
        }
      }
      layout.push({
        h: height,
        w: width,
        i: name,
        x,
        y
      })
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (value) {
        if (!value) { return false }
        this.widgets = {}
        this.layout = []
        Object.keys(value).forEach(topic => {
          if (!value[topic]) { return false }
          Object.keys(value[topic]).forEach(name => {
            if (!this.widgets[name]) {
              this.initWidget(name)
              this.initWidgetInLayout(name)
            }
          })
        })
      }
    },
    item: {
      deep: true,
      handler () {
        if (!this.value) { return false }
        this.widgets = {}
        this.layout = []
        Object.keys(this.value).forEach(topic => {
          if (!this.value[topic]) { return false }
          Object.keys(this.value[topic]).forEach(name => {
            if (!this.widgets[name]) {
              this.initWidget(name)
              this.initWidgetInLayout(name)
            }
          })
        })
      }
    }
  },
  mixins: [getValueByTopic],
  components: {
    Switcher,
    Informer,
    Radial,
    Linear,
    Singleselect,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  }
}
</script>
