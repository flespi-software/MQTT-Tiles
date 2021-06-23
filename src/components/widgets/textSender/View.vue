<template>
  <div class="text-sender__payload-wrapper relative-position" style="height: 100%;">
    <q-btn size="0.7rem" class="text-sender__send q-pa-none q-mr-xs absolute-bottom-right" icon="mdi-send" @click="sendHandler" dense flat color="yellow-9">
      <q-tooltip>Send</q-tooltip>
    </q-btn>
    <textarea class="text-sender__payload absolute-top-left absolute-bottom-right" placeholder="Type your text here" v-model="textModel"/>
  </div>
</template>

<style lang="stylus">
  .text-sender__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
  .text-sender__payload
    border none
    outline 0
    width 100%
    height 100%
    resize none
    border 1px solid rgba(0, 0, 0, .1)
  .text-sender__send
    min-height 1rem
    z-index 1
    opasity .6
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
export default {
  name: 'TextSender',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      textModel: ''
    }
  },
  methods: {
    setTextModel (text) {
      this.textModel = text
    },
    sendHandler () {
      const data = { topic: this.item.settings.topics[0].topicFilter, payload: this.textModel, settings: { retain: this.item.settings.save } }
      this.$emit('action', data)
    }
  },
  computed: {
    text () {
      const topic = this.item.settings.topics[0],
        value = this.getValueByTopic(this.value[topic.topicFilter] && this.value[topic.topicFilter].payload, topic)
      this.setTextModel(value)
      return value
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler () {
        const topic = this.item.settings.topics[0],
          value = this.getValueByTopic(this.value[topic.topicFilter] && this.value[topic.topicFilter].payload, topic)
        this.setTextModel(value)
      }
    }
  },
  mixins: [getValueByTopic, formatValue]
}
</script>
