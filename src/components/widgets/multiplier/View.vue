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
          :style="{width: widgetsWidth, minHeight: item.settings.type === 'radial' || item.settings.type === 'linear' ? `${50 * item.settings.widgetSettings.height}px` : ''}"
          class="q-ma-sm"
        >
          <component
            class="wrapper__items"
            :is="item.settings.type"
            :item="widgets[widgetIndex]"
            :value="values[widgetIndex]"
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
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import VueGridLayout from 'vue-grid-layout'
import Switcher from '../switcher/View'
import Informer from '../informer/View'
import Radial from '../radial/View'
import Linear from '../linear/View'
import Singleselect from '../singleselect/View'
import Complex from '../complex/View'
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
    currentTopic () {
      let topic = this.item.dataTopics[0].topicFilter
      let pathByGroup = topic.split('/').slice(0, this.item.settings.groupLayout + 1)
      let topicByGroup = pathByGroup.join('/')
      return topicByGroup
    },
    currentValue () {
      if (!this.value) { return {} }
      let topic = this.item.dataTopics[0].topicFilter
      if (!topic || !this.value[topic]) { return {} }
      let path = this.currentTopic.split('/')
      let value = null
      if (path.indexOf('+') === -1) {
        value = get(this.value[topic], path.slice(0, -1).join('.'), null)
      } else {
        value = path.reduce((val, pathPart, index) => {
          if (pathPart === '+') {
            val = val.reduce((resultItems, item) => {
              let keys = Object.keys(item.value)
              keys.forEach((key) => {
                let nestItem = {
                  name: `${item.name ? `${item.name}.` : ''}${key}`,
                  value: item.value[key]
                }
                resultItems.push(nestItem)
              })
              return resultItems
            }, [])
          } else {
            val = val.reduce((val, item, index) => {
              val[index].value = item.value[pathPart]
              return val
            }, val)
          }
          return val
        }, [{name: '', value: this.value[topic]}])

        value = value.reduce((value, item) => {
          value[item.name] = item.value
          return value
        }, {})
      }
      value = Object.keys(value).reduce((val, name) => {
        val[name] = {
          payload: value[name]
        }
        return val
      }, {})
      return value
    },
    values () {
      return Object.keys(this.currentValue).reduce((values, widgetId) => {
        let widget = this.widgets[widgetId]
        let topic = this.item.dataTopics[0].topicFilter
        let value = {[topic]: this.currentValue[widgetId]}
        widget.topics.forEach((currentTopic) => {
          if (topic === currentTopic) { return false }
          value[currentTopic] = {}
          value[currentTopic].payload = this.value[currentTopic].payload
        })
        values[widgetId] = value
        return values
      }, {})
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
    initMultiplier () {
      let value = this.currentValue
      if (!value) { return false }
      this.widgets = {}
      this.layout = []
      Object.keys(value).forEach(name => {
        if (!this.widgets[name]) {
          this.initWidget(name)
          this.initWidgetInLayout(name)
        }
      })
    },
    initWidget (name) {
      let topics = [this.item.dataTopics[0].topicFilter]
      if (this.item.settings.widgetSettings.topics) {
        topics = [this.item.dataTopics[0].topicFilter, ...this.item.settings.widgetSettings.topics.map(topic => topic.topicFilter)]
      }
      let widget = {
        name,
        id: name,
        color: this.item.settings.color,
        type: this.item.settings.type,
        topics,
        dataTopics: [{payloadField: this.item.dataTopics[0].payloadField, payloadType: this.item.dataTopics[0].payloadType, topicFilter: this.item.dataTopics[0].topicFilter}], // topics for datasource
        settings: cloneDeep(this.item.settings.widgetSettings),
        status: WIDGET_STATUS_DISABLED
      }
      this.$set(this.widgets, name, widget)
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
        this.initMultiplier()
      }
    },
    item: {
      deep: true,
      handler () {
        this.initMultiplier()
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
    Complex,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  }
}
</script>
