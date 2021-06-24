<template>
  <div class="multi-informer__payload-wrapper" style="padding-bottom: 15px;">
    <text-view
      v-for="(text, index) in text"
      :key="index"
      class="multi-informer__payload"
      :class="[`text-${value[item.settings.items[index].topic.topicFilter] !== null ? 'grey-9' : 'grey-5'}`]"
      :text="text"
      :title="title[index]"
      :prefix="item.settings.items[index].prefix"
      :postfix="item.settings.items[index].postfix"
      :settings="item.settings.items[index]"
    />
  </div>
</template>

<style lang="stylus">
  .multi-informer__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
  .multi-informer__payload
    font-size 1.2rem
    word-break break-all
    display block
    padding 2px 4px
</style>

<script>
import get from 'lodash/get'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import TextView from '../TextView'
import formatValue from '../../../mixins/formatValue.js'
export default {
  name: 'MultiInformer',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    }
  },
  computed: {
    title () {
      return this.item.settings.items.map(item => {
        const topic = item.topic.topicFilter
        const value = get(this.value, `['${topic}'].payload`, null)
        return this.getValueByTopic(value, item.topic)
      })
    },
    text () {
      // return this.formatValue(this.title, this.item.settings)
      return this.title.map((title, index) => {
        const item = this.item.settings.items[index]
        return this.formatValue(title, item)
      })
    }
  },
  components: { TextView },
  mixins: [getValueByTopic, formatValue]
}
</script>
