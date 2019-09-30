<template>
  <q-card flat inline class="widget__frame" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`, `${blocked ? 'scroll' : ''}`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
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
    <q-card-media class="widget__content scroll" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 29px);">
      <div style="width: 100%; height: 100%;">
        <div class="frame__payload" style="height: 100%">
          <q-resize-observable @resize="onResize" />
          <iframe v-if="link !== null" :src="link" frameborder="0" :height="height" :width="width" autoplay ref="frame" allowfullscreen></iframe>
          <div v-else style="height: 95%;" class="bg-grey-5 text-grey-8 relative-position q-pt-xs">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
              <q-icon name="mdi-block-helper" :size="`${height / 2}px`"/>
            </div>
            <div style="font-size: 1.5rem;">Invalid link address</div>
          </div>
        </div>
      </div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .frame__payload
    font-size 1.2rem
    word-break break-all
    overflow auto
    width 100%
    display block
    padding 2px 4px
    text-align center
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
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
import get from 'lodash/get'
import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
export default {
  name: 'Frame',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      width: 0,
      height: 0,
      currentPayloads: [],
      isReadyMap: false,
      IFRAME_MODE_INTEGRATION,
      IFRAME_MODE_SHOW
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    onResize ({width, height}) {
      this.width = width - 16
      this.height = height - 16
    },
    send (msg) {
      this.$refs.frame && this.$refs.frame.contentWindow.postMessage(msg, '*')
    },
    getPayload (itemIndex) {
      let payload
      if (this.item.settings.mode === IFRAME_MODE_INTEGRATION) {
        let topic = this.item.settings.items[itemIndex].topic
        let value = this.getValueByTopic(this.value[topic.topicFilter] && this.value[topic.topicFilter].payload, topic)
        payload = this.item.settings.items[itemIndex].template
        payload = payload.replace('<{topic}>', this.value && this.value.topic)
        payload = payload.replace('<{payload}>', JSON.stringify(value))
        payload = payload.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (_, name) => {
          return JSON.stringify(get(value, name, null))
        })
      }
      return payload
    },
    update () {
      this.item.settings.items.forEach((item, index) => {
        if (!this.isReadyMap) { return false }
        let payload = this.getPayload(index)
        if (this.currentPayloads[index] !== payload) {
          this.send(payload)
        }
        this.$set(this.currentPayloads, index, payload)
      })
    }
  },
  computed: {
    link () {
      if (this.item.settings.mode === IFRAME_MODE_INTEGRATION) {
        return this.item.settings.link
      } else {
        let urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#/%?=~_|!:,.;]*[a-z0-9-+&@#/%=~_|]/gim
        let linkValue = this.getValueByTopic(this.value[this.item.dataTopics[0].topicFilter] && this.value[this.item.dataTopics[0].topicFilter].payload, this.item.dataTopics[0])
        return linkValue && linkValue.toString().match(urlPattern) ? linkValue : null
      }
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        this.update()
      }
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === 'MapView|state:{"ready": true}') {
        this.isReadyMap = true
        this.update()
      }
    })
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
