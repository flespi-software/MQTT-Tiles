<template>
  <div class="q-mb-sm">
    <div ref="itemsTop" class="items__top flex q-px-md q-py-xs" v-if="topItems.length">
      <component
        v-for="(renderItem, layoutIndex) in topItems"
        :key="`top${layoutIndex}${renderItem.index}`"
        :is="`my-${renderItems[renderItem.index].type}`"
        :item="renderItems[renderItem.index]"
        :value="renderItem.val"
        :color="item.color"
      />
    </div>
    <div class="row">
      <div class="items__left flex q-pa-sm" v-if="leftItems.length" :class="{'col-6': leftItems.length && rightItems.length, 'col-12': !rightItems.length, 'justify-center': !rightItems.length}" style="overflow: hidden;">
        <component
          v-for="(renderItem, layoutIndex) in leftItems"
          :key="`left${layoutIndex}${renderItem.index}`"
          :is="`my-${renderItems[renderItem.index].type}`"
          :item="renderItems[renderItem.index]"
          :value="renderItem.val"
          :color="item.color"
        />
      </div>
      <div class="items__right q-pa-sm" v-if="rightItems.length" :class="{'col-6': leftItems.length && rightItems.length, 'col-12': !leftItems.length}">
        <component
          v-for="(renderItem, layoutIndex) in rightItems"
          :key="`right${layoutIndex}${renderItem.index}`"
          :is="`my-${renderItems[renderItem.index].type}`"
          :item="renderItems[renderItem.index]"
          :value="renderItem.val"
          :color="item.color"
        />
      </div>
    </div>
    <div ref="itemsBottom" class="items__bottom flex q-px-md q-py-xs" v-if="bottomItems.length">
      <component
        v-for="(renderItem, layoutIndex) in bottomItems"
        :key="`bottom${layoutIndex}${renderItem.index}`"
        :is="`my-${renderItems[renderItem.index].type}`"
        :item="renderItems[renderItem.index]"
        :value="renderItem.val"
        :color="item.color"
      />
    </div>
  </div>
</template>

<style lang="stylus">
.items__top
  top 0px
  left 8px
  right 8px
  background-color rgba(255,255,255,0.5)
  min-height 50px
  max-height 33%
.items__bottom
  bottom 0px
  left 8px
  right 8px
  background-color rgba(255,255,255,0.5)
  max-height 33%
  min-height 50px
</style>

<script>
import { WIDGET_STATUS_DISABLED, WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import get from 'lodash/get'
import Text from './Text'
import Knob from './Knob'
import Progress from './Progress'
export default {
  name: 'Complex',
  props: ['item', 'index', 'value', 'mini'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    currentValue: {
      get () {
        const value = this.value[this.item.dataTopics[0].topicFilter] && this.value[this.item.dataTopics[0].topicFilter].payload
        if (value === null) {
          return null
        } else {
          const topic = this.item.dataTopics[0]
          if (topic.payloadType === WIDGET_PAYLOAD_TYPE_STRING) {
            topic.payloadType = WIDGET_PAYLOAD_TYPE_JSON
          }
          return this.getValueByTopic(value, this.item.dataTopics[0])
        }
      }
    },
    renderItems () {
      return this.item.settings.items.reduce((items, item) => {
        const resItem = {
          type: item.type,
          label: item.label,
          position: item.position,
          index: item.index,
          val: item.path ? get(this.currentValue, item.path, 'N/A') : this.currentValue === null ? 'N/A' : this.currentValue
        }
        switch (item.type) {
          case 'knob': {
            resItem.min = item.minValueMode
              ? parseFloat(this.getValueByTopic(this.value[item.minValue.topicFilter] && this.value[item.minValue.topicFilter].payload, item.minValue))
              : item.minValue
            resItem.max = item.maxValueMode
              ? parseFloat(this.getValueByTopic(this.value[item.maxValue.topicFilter] && this.value[item.maxValue.topicFilter].payload, item.maxValue))
              : item.maxValue
            break
          }
          case 'progress': {
            resItem.min = item.minValueMode
              ? parseFloat(this.getValueByTopic(this.value[item.minValue.topicFilter] && this.value[item.minValue.topicFilter].payload, item.minValue))
              : item.minValue
            resItem.max = item.maxValueMode
              ? parseFloat(this.getValueByTopic(this.value[item.maxValue.topicFilter] && this.value[item.maxValue.topicFilter].payload, item.maxValue))
              : item.maxValue
            break
          }
          case 'text': {
            resItem.math = item.math || ''
            resItem.valueFormat = item.valueFormat || 0
            break
          }
        }
        items.push(resItem)
        return items
      }, [])
    },
    topItems () {
      return this.renderItems.filter(item => item.position === 'top')
    },
    leftItems () {
      return this.renderItems.filter(item => item.position === 'left')
    },
    rightItems () {
      return this.renderItems.filter(item => item.position === 'right')
    },
    bottomItems () {
      return this.renderItems.filter(item => item.position === 'bottom')
    }
  },
  methods: {
    get,
  },
  mixins: [getValueByTopic],
  components: {
    MyText: Text,
    MyKnob: Knob,
    MyProgress: Progress
  }
}
</script>
