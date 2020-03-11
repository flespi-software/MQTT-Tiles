<template>
  <q-card flat inline class="widget__text-sender" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side style="min-width: 20px;">
          <div>
            <q-btn size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-send" @click="sendHandler" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
              <q-tooltip>Send</q-tooltip>
            </q-btn>
            <q-btn size="0.7rem" v-if="!blocked" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
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
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div class="text-sender__payload-wrapper relative-position" style="height: 100%;">
        <textarea style="border: none; outline: 0; width: 100%; height: 100%; resize: none; border: 1px solid rgba(0, 0, 0, .1)" class="absolute-top-left absolute-bottom-right" placeholder="Type your text here" v-model="textModel"/>
      </div>
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="bottom: 1px; left: 1px; font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
</template>

<style lang="stylus">
  .text-sender__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
  .text-sender__payload
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
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'TextSender',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      textModel: ''
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
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
    },
    contentHeight () {
      const height = 'calc(100% - 44px)'
      return height
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
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
