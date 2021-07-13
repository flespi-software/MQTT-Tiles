<template>
  <div style="width: 100%; position: relative;">
    <div
      v-for="(widget, widgetIndex) in renderedWidgets"
      :key="widgetIndex"
      style="display: inline-block; position: relative;"
      class="q-ma-sm"
      :style="{
        width: widgetsWidth,
        minHeight: item.settings.type === 'radial' || item.settings.type === 'linear' ?
          `${50 * item.settings.widgetSettings.height}px` : ''
      }"
    >
      <q-card flat inline class="multiplier__widget-wrapper full-height full-width" :class="wrapperClasses">
        <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0;">
          <q-item-section class="ellipsis" :class="[`text-${item.settings.color}-7`]" style="font-size: .9rem">
            <q-item-label class="ellipsis">{{widget.name}}</q-item-label>
            <q-tooltip>{{widget.name}}</q-tooltip>
          </q-item-section>
        </q-item>
        <q-card-section class="q-pa-none" style="height: calc(100% - 25px)">
          <component
            :is="item.settings.type"
            :item="widgets[widgetIndex]"
            :value="values[widgetIndex]"
            :index="widgetIndex"
            @action="(data) => { $emit('action', data) }"
          />
        </q-card-section>
        <div v-if="widgets[widgetIndex].settings.isNeedTime" class="widget__timestamp absolute-bottom-left" :class="[`text-${item.settings.color}-7`, `bg-${item.settings.color}-1`]">
          {{getTime(values[widgetIndex])}}
        </div>
      </q-card>
    </div>
    <div class="flex flex-center" v-if="widgetsIds.length > limit">
      <q-pagination v-model="batch" :max="Math.ceil(widgetsIds.length / limit)" :max-pages="item.settings.width" direction-links :color="item.color"/>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
  .multiplier__widget-wrapper
    border-radius 4px
    border $grey-5 solid 1px
</style>

<script>
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import cloneDeep from 'lodash/cloneDeep'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { getTimeByTimestamp, getTimeByPacket } from '../../../mixins/timestamp.js'
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
  props: ['item', 'index', 'value', 'mini', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      widgets: {},
      batch: 1,
      limit: 100
    }
  },
  computed: {
    wrapperClasses () {
      const classes = [`bg-${this.item.settings.color}-1`]
      if (this.item.settings.type === 'radial' || this.item.settings.type === 'linear') {
        classes.push('absolute')
      }
      return classes
    },
    currentTopic () {
      const topic = get(this.item, 'dataTopics[0].topicFilter')
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
      const topic = get(this.item, 'dataTopics[0].topicFilter')
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
        val[name] = value[name]
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
          value[currentTopic].payload = get(this.value, `['${currentTopic}'].payload`)
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
      let topics = [get(this.item, 'dataTopics[0].topicFilter')]
      if (this.item.settings.widgetSettings.topics) {
        topics = [...topics, ...this.item.settings.widgetSettings.topics.map(topic => topic.topicFilter)]
      }
      let widgetName = name
      if (get(this.item, 'dataTopics[0].payloadType') === 1 && this.item.settings.nameField) {
        const value = get(this.currentValue, `['${name}'].payload`, null)
        widgetName = this.getValueByTopic(value, { ...this.item.dataTopics[0], payloadField: this.item.settings.nameField })
      }
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
    },
    getTime (data) {
      const packet = data[this.currentTopic]
      return getTimeByTimestamp(getTimeByPacket(packet))
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
