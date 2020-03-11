<template>
  <q-card flat inline class="widget__informer" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
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
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="bottom: 1px; left: 1px; font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
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
import TextView from '../TextView'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'MultiInformer',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
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
      // return this.getValueByTopic(this.value[this.topic] && this.value[this.topic].payload, this.item.dataTopics[0])
      return this.item.settings.items.map(item => {
        const topic = item.topic.topicFilter
        return this.getValueByTopic(this.value[topic] && this.value[topic].payload, item.topic)
      })
    },
    text () {
      // return this.formatValue(this.title, this.item.settings)
      return this.title.map((title, index) => {
        const item = this.item.settings.items[index]
        return this.formatValue(title, item)
      })
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 24px)' }
      return height
    }
  },
  components: { TextView },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
