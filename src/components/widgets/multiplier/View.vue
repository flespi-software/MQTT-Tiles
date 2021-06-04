<template>
  <q-card flat inline class="widget__multiplier q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.7rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-menu anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
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
        </q-item-section>
      </transition>
    </q-item>
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div style="width: 100%; position: relative;">
        <div
          v-for="(widget, widgetIndex) in renderedWidgets"
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
            :integration="true"
            @action="(data) => { $emit('action', data) }"
          />
        </div>
        <div class="flex flex-center" v-if="widgetsIds.length > limit">
          <q-pagination v-model="batch" :max="Math.ceil(widgetsIds.length / limit)" :max-pages="item.settings.width" direction-links :color="item.color"/>
        </div>
      </div>
    </q-card-section>
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
import uniq from 'lodash/uniq'
import cloneDeep from 'lodash/cloneDeep'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import Switcher from '../switcher/View'
import Informer from '../informer/View'
import Radial from '../radial/View'
import Linear from '../linear/View'
import Singleselect from '../singleselect/View'
import Complex from '../complex/View'
import MapLocation from '../mapLocation/View'
import MapRoute from '../mapRoute/View'
export default {
  name: 'Multiplier',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      widgets: {},
      batch: 1,
      limit: 100
    }
  },
  computed: {
    currentTopic () {
      const topic = this.item.dataTopics[0].topicFilter
      const pathByGroup = topic.split('/').slice(0, this.item.settings.groupLayout + 1)
      const topicByGroup = pathByGroup.join('/')
      return topicByGroup
    },
    renderedWidgets () {
      const min = (this.batch - 1) * this.limit,
        max = this.batch * this.limit
      return this.widgetsIds.reduce((widgets, widgetId, widgetIndex) => {
        if (widgetIndex >= min && widgetIndex < max) {
          widgets[widgetId] = this.widgets[widgetId]
        }
        return widgets
      }, {})
    },
    widgetsIds () {
      return Object.keys(this.widgets)
    },
    currentValue () {
      if (!this.value) { return {} }
      const topic = this.item.dataTopics[0].topicFilter
      if (!topic || !this.value[topic]) { return {} }
      const path = this.currentTopic.split('/')
      /* update path by flespi enum (comma separated) subscriptions */
      path.forEach((pathPart, index) => { if (pathPart.indexOf(',') !== -1) { path[index] = '+' } })
      let value = null
      if (path.indexOf('+') === -1) {
        value = path.length === 1 ? this.value[topic] : get(this.value[topic], path.slice(0, -1).join('.'), null)
      } else {
        value = path.reduce((val, pathPart, index) => {
          if (pathPart === '+') {
            val = val.reduce((resultItems, item) => {
              const keys = Object.keys(item.value)
              keys.forEach((key) => {
                const nestItem = {
                  name: `${item.name ? `${item.name}[` : ''}${key}${item.name ? ']' : ''}`,
                  value: item.value[key]
                }
                resultItems.push(nestItem)
              })
              return resultItems
            }, [])
          } else {
            val = val.reduce((val, item, index) => {
              val[index].value = item.value && item.value[pathPart]
              return val
            }, val)
          }
          return val
        }, [{ name: '', value: this.value[topic] }])

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
        const widget = this.widgets[widgetId]
        if (!widget) { return values }
        const topic = this.item.dataTopics[0].topicFilter
        const value = { [topic]: this.currentValue[widgetId] }
        widget.topics.forEach((currentTopic) => {
          if (topic === currentTopic) { return false }
          value[currentTopic] = {}
          value[currentTopic].payload = this.value[currentTopic] && this.value[currentTopic].payload
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
    },
    contentHeight () {
      let height = 'calc(100% - 22px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 4px)' }
      return height
    }
  },
  methods: {
    needRender (value) {
      return this.item.settings.math ? this.mathProcessing(value, this.item.settings.math) : true
    },
    initMultiplier () {
      const value = this.currentValue
      if (!value) { return false }
      this.widgets = {}
      Object.keys(value).forEach(name => {
        const needRender = this.needRender(value[name] && value[name].payload)
        if (!this.widgets[name] && needRender) {
          this.initWidget(name)
        }
      })
    },
    processingMultiplier () {
      const value = this.currentValue,
        widgets = this.widgets,
        valueKeys = Object.keys(value),
        widgetsKeys = Object.keys(widgets),
        allKeys = uniq([...valueKeys, ...widgetsKeys])
      allKeys.forEach((name, keyIndex) => {
        const needRender = this.needRender(value[name] && value[name].payload)
        if (value[name] && !widgets[name] && needRender) {
          // add
          this.initWidget(name)
        } else if ((!(value[name] && value[name].payload !== undefined) && widgets[name]) || !needRender) {
          // remove
          this.$delete(widgets, name)
        }
      })
    },
    getWidgetByName (name) {
      let topics = [this.item.dataTopics[0].topicFilter]
      if (this.item.settings.widgetSettings.topics) {
        topics = [this.item.dataTopics[0].topicFilter, ...this.item.settings.widgetSettings.topics.map(topic => topic.topicFilter)]
      }
      const widgetName = this.item.dataTopics[0].payloadType === 1 && this.item.settings.nameField
        ? this.getValueByTopic(this.currentValue[name] && this.currentValue[name].payload, { ...this.item.dataTopics[0], payloadField: this.item.settings.nameField })
        : name
      const widget = {
        name: widgetName,
        id: name,
        color: this.item.settings.color,
        type: this.item.settings.type,
        topics,
        dataTopics: [{ ...this.item.dataTopics[0] }], // topics for datasource
        settings: cloneDeep(this.item.settings.widgetSettings),
        status: WIDGET_STATUS_DISABLED
      }
      return widget
    },
    initWidget (name) {
      this.$set(this.widgets, name, this.getWidgetByName(name))
    }
  },
  created () {
    this.initMultiplier()
  },
  watch: {
    value: {
      deep: true,
      handler (value) {
        this.processingMultiplier()
      }
    },
    'item.dataTopics': {
      deep: true,
      handler () {
        this.initMultiplier()
      }
    }
  },
  mixins: [getValueByTopic, formatValue],
  components: {
    Switcher,
    Informer,
    Radial,
    Linear,
    Singleselect,
    Complex,
    MapLocation,
    MapRoute
  }
}
</script>
