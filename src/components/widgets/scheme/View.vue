<template>
  <div class="full-width full-height">
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
  </div>
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
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import TextView from './TextView'
import ToggleView from './ToggleView'
import StatusView from './StatusView'
import StaticTextView from './StaticTextView'
import formatValue from '../../../mixins/formatValue.js'
export default {
  name: 'Scheme',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
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
    }
  },
  components: { TextView, ToggleView, StatusView, StaticTextView },
  mixins: [getValueByTopic, formatValue]
}
</script>
