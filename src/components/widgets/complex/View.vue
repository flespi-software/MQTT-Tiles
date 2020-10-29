<template>
  <q-card flat inline class="widget__complex q-py-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none q-px-sm" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <div>
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
          </div>
        </q-item-section>
      </transition>
    </q-item>
    <q-card-section class="widget__content" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <q-resize-observer @resize="setPaddings" />
      <div ref="itemsTop" class="items__top flex q-px-md q-py-xs absolute scroll" v-if="topItems.length">
        <component
          v-for="(renderItem, layoutIndex) in topItems"
          :key="`top${layoutIndex}${renderItem.index}`"
          :is="`my-${renderItems[renderItem.index].type}`"
          :item="renderItems[renderItem.index]"
          :value="renderItem.val"
          :color="item.color"
        />
      </div>
      <div class="scroll row" :style="{ marginTop: `${mainMarginTop}px`, marginBottom: `${mainMarginBottom}px`, maxHeight: `calc(100% - ${mainMarginTop + mainMarginBottom}px)` }">
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
      <div ref="itemsBottom" class="items__bottom flex q-px-md q-py-xs absolute scroll" v-if="bottomItems.length">
        <component
          v-for="(renderItem, layoutIndex) in bottomItems"
          :key="`bottom${layoutIndex}${renderItem.index}`"
          :is="`my-${renderItems[renderItem.index].type}`"
          :item="renderItems[renderItem.index]"
          :value="renderItem.val"
          :color="item.color"
        />
      </div>
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px; bottom: 1px; left: 1px; user-select: none;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
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
import timestamp from '../../../mixins/timestamp.js'
import get from 'lodash/get'
import Text from './Text'
import Knob from './Knob'
import Progress from './Progress'
export default {
  name: 'Complex',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      mainMarginTop: 0,
      mainMarginBottom: 0
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
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 24px)' }
      return height
    }
  },
  methods: {
    get,
    setPaddings () {
      this.mainMarginTop = this.$refs.itemsTop ? this.$refs.itemsTop.offsetHeight : 0
      this.mainMarginBottom = this.$refs.itemsBottom ? this.$refs.itemsBottom.offsetHeight : 0
    }
  },
  mounted () { this.setPaddings() },
  updated () { this.setPaddings() },
  mixins: [getValueByTopic, timestamp],
  components: {
    MyText: Text,
    MyKnob: Knob,
    MyProgress: Progress
  }
}
</script>
