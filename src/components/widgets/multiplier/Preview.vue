<template>
  <div style="width: 100%; position: relative;">
    <div
      v-for="(widget, widgetIndex) in widgets"
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
            :value="{}"
            :index="widgetIndex"
            :blocked="true"
          />
        </q-card-section>
        <div v-if="widgets[widgetIndex].settings.isNeedTime" class="widget__timestamp absolute-bottom-left" :class="[`text-${item.settings.color}-7`, `bg-${item.settings.color}-1`]">
          12:00:00
        </div>
      </q-card>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
  .multiplier__widget-wrapper
    border-radius 4px
    border $grey-5 solid 1px
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import Switcher from '../switcher/View'
import Informer from '../informer/View'
import Radial from '../radial/View'
import Linear from '../linear/View'
import Singleselect from '../singleselect/View'
import Complex from '../complex/Preview'
import { getTopicModel } from '../../../constants/defaultes'
export default {
  name: 'MultiplierPreview',
  props: ['item', 'index', 'value'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    widgets () {
      let exampleNames = ['example', 'example1', 'example2']
      if (this.item.settings.type === 'complex') {
        exampleNames = ['example']
      }
      const defaults = {
        switcher: '1',
        informer: '*some text*',
        radial: 50,
        linear: 50,
        singleselect: '1',
        complex: '{"a": 1, "b": 2, "c": 3}'
      }
      return exampleNames.reduce((result, name) => {
        result[name] = {
          name,
          id: name,
          color: this.item.settings.color,
          type: this.item.settings.type,
          topics: ['example'],
          dataTopics: [getTopicModel({topicTemplate: 'example', topicFilter: 'example', default: defaults[this.item.settings.type]})], // topics for datasource
          settings: cloneDeep(this.item.settings.widgetSettings),
          status: WIDGET_STATUS_DISABLED
        }
        return result
      }, {})
    },
    wrapperClasses () {
      const classes = [`bg-${this.item.settings.color}-1`]
      if (this.item.settings.type === 'radial' || this.item.settings.type === 'linear') {
        classes.push('absolute')
      }
      return classes
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
  components: {
    Switcher,
    Informer,
    Radial,
    Linear,
    Singleselect,
    Complex
  }
}
</script>
