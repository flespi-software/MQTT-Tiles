<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${text !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>{{`${text}`}}<span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </div>
      <q-tooltip ref="tooltip">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
        {{`${text}`}}
        <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else class="informer__payload-wrapper" style="padding-bottom: 15px;">
    <text-view
      class="informer__payload"
      :class="[`text-${value[topic] !== null ? 'grey-9' : 'grey-5'}`]"
      :text="text"
      :title="title"
      :prefix="item.settings.prefix"
      :postfix="item.settings.postfix"
      :settings="item.settings"
    />
  </div>
</template>

<style lang="stylus">
  .informer__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
  .informer__payload
    font-size 1.2rem
    word-break break-all
    display block
    padding 2px 4px
</style>

<script>
import get from 'lodash/get'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import TextView from '../TextView'
export default {
  name: 'Informer',
  props: ['item', 'index', 'mini', 'value'],
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
    topic () {
      return get(this.item, 'dataTopics[0].topicFilter')
    },
    title () {
      const value = get(this.value, `['${this.topic}'].payload`, null)
      return this.getValueByTopic(value, this.item.dataTopics[0])
    },
    text () {
      return this.formatValue(this.title, this.item.settings)
    },
    stringLength () {
      return this.item.settings.prefix.length + this.text.length + this.item.settings.postfix.length
    }
  },
  components: { TextView },
  mixins: [getValueByTopic, formatValue]
}
</script>
