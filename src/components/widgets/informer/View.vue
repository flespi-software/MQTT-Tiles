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
  <q-card flat v-else inline class="widget__informer" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
            <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
          </q-btn>
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                <q-btn v-close-overlay v-if="item.settings.width === 1" size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
                  <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Duplicate</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
              </div>
            </q-popover>
          </q-btn>
        </q-item-side>
      </transition>
    </q-item>
    <q-card-media class="widget__content scroll" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div class="informer__payload-wrapper" style="padding-bottom: 15px;">
        <text-view
          class="informer__payload"
          :class="[`text-${value[topic] !== null ? 'dark' : 'grey-5'}`]"
          :text="text"
          :title="title"
          :prefix="item.settings.prefix"
          :postfix="item.settings.postfix"
          :settings="item.settings"
        />
      </div>
    </q-card-media>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="bottom: 1px; left: 1px; font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
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
import TextView from '../TextView'
export default {
  name: 'Informer',
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
    topic () {
      return this.item.dataTopics[0].topicFilter
    },
    title () {
      return this.getValueByTopic(this.value[this.topic] && this.value[this.topic].payload, this.item.dataTopics[0])
    },
    text () {
      return this.formatValue(this.title, this.item.settings)
    },
    stringLength () {
      return this.item.settings.prefix.length + this.text.length + this.item.settings.postfix.length
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) { height = 'calc(100% - 26px)' }
      return height
    }
  },
  components: { TextView },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
