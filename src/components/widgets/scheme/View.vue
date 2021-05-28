<template>
  <q-card flat inline class="widget__scheme" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
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
      <q-resize-observer @resize="onResize" />
      <div class="scheme-view__image-wrapper q-pa-xs relative-position row inline" :style="wrapperStyle">
        <img ref="image" :src='item.settings.image' :style="imageStyle" draggable="false" />
        <div
          v-for="(miniItem, index) in item.settings.items" :key="index"
          class="scheme__item-view-wrapper absolute"
          :style="{
            left: `${miniItem.position.left}%`,
            top: `${miniItem.position.top}%`,
            width: `${miniItem.width}%`,
            height: `${miniItem.height}%`
          }"
        >
          <component
            :is="`${miniItem.type}-view`"
            ref="items"
            :item="item.settings.items[index]"
            :widget="item"
            :value="values[index]"
            @action="data => $emit('action', data)"
          />
        </div>
      </div>
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="bottom: 1px; left: 1px; font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
</template>

<style lang="stylus">
  .scheme-view__image-wrapper
    position relative
    overflow hidden
  .scheme__payload
    font-size 1.2rem
    word-break break-all
    display block
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
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import TextView from './TextView'
import ToggleView from './ToggleView'
import StatusView from './StatusView'
import StaticTextView from './StaticTextView'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'Scheme',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      imageStyle: {},
      wrapperStyle: {}
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    onResize ({ width, height }) {
      const style = {}
      style.maxHeight = `${height - 10}px`
      style.maxWidth = `${width - 8}px`
      this.imageStyle = style
      this.$nextTick(() => {
        const wrapperStyle = {}
        const image = this.$refs.image.getBoundingClientRect()
        wrapperStyle.marginLeft = `${(width - image.width - 8) / 2}px`
        wrapperStyle.marginTop = `${(height - image.height - 10) / 2}px`
        this.wrapperStyle = wrapperStyle
        const items = this.$refs.items
        items && items.forEach(item => item.fit && item.fit())
      })
    }
  },
  computed: {
    values () {
      return this.item.settings.items.map(miniWidget => {
        const topic = miniWidget.topic
        const filter = (topic && topic.topicFilter) || null
        let result
        if (this.value[filter]) {
          result = this.value[filter].payload
        }
        return result
      })
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 24px)' }
      return height
    }
  },
  components: { TextView, ToggleView, StatusView, StaticTextView },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
