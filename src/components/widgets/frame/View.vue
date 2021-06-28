<template>
  <div style="width: 100%; height: 100%;">
    <div class="frame__payload" style="height: 100%">
      <q-resize-observer @resize="onResize" />
      <iframe v-if="link !== null" :src="link" frameborder="0" :height="height" :width="width" autoplay ref="frame" allowfullscreen></iframe>
      <div v-else style="height: 95%;" class="bg-grey-5 text-grey-8 relative-position q-pt-xs">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <q-icon name="mdi-block-helper" :size="`${height / 2}px`"/>
        </div>
        <div style="font-size: 1.5rem;">Invalid link address</div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .frame__payload
    font-size 1.2rem
    word-break break-all
    overflow hidden
    width 100%
    display block
    text-align center
</style>

<script>
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import get from 'lodash/get'
import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
export default {
  name: 'Frame',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      width: 0,
      height: 0,
      currentPayloads: [],
      isReady: !this.item.settings.readyMessage,
      IFRAME_MODE_INTEGRATION,
      IFRAME_MODE_SHOW
    }
  },
  methods: {
    onResize ({ width, height }) {
      this.width = width
      this.height = height
    },
    send (msg) {
      this.$refs.frame && this.$refs.frame.contentWindow.postMessage(msg, '*')
    },
    getPayload (itemIndex) {
      let payload
      if (this.item.settings.mode === IFRAME_MODE_INTEGRATION) {
        const topic = this.item.settings.items[itemIndex].topic
        const data = get(this.value, `['${topic.topicFilter}'].payload`, null)
        const value = this.getValueByTopic(data, topic)
        const valuedTopic = get(this.value, `['${topic.topicFilter}'].topic`)
        const path = valuedTopic && valuedTopic.split('/')
        payload = this.item.settings.items[itemIndex].template
        payload = payload.replace('<{topic}>', valuedTopic)
        payload = payload.replace(/<{topic\[(\d)\]}>/g, (_, index) => {
          return path && path[index]
        })
        payload = payload.replace(/<{payload}>/g, JSON.stringify(value))
        payload = payload.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (_, name) => {
          return JSON.stringify(get(value, name, null))
        })
      }
      return payload
    },
    update () {
      this.item.settings.items.forEach((item, index) => {
        if (!this.isReady) { return false }
        const payload = this.getPayload(index)
        if (this.currentPayloads[index] !== payload) {
          this.send(payload)
        }
        this.$set(this.currentPayloads, index, payload)
      })
    },
    checkTopicByAcl (topic, acl) {
      if (topic.indexOf('+') !== -1 || topic.indexOf('#') !== -1) { return false }
      return acl.some(aclTopic => {
        const aclRegExp = new RegExp(
          aclTopic
            .replace('+', '[0-9a-zA-Z-,.]+$')
            .replace('#', '(.*)')
        )
        return !!topic.match(aclRegExp)
      })
    },
    handleActionMessage (data) {
      if (typeof data === 'string' && data.indexOf('MQTTTiles|') === 0) {
        let cmd = '',
          payload = null
        data = data.split('|')
        const hasPostkey = data[1].indexOf('=>') === -1
        data = data[hasPostkey ? 2 : 1].split('=>')
        cmd = data[0]
        try {
          payload = JSON.parse(data[1])
        } catch (e) {
          payload = data[1]
        }
        if (cmd === 'publish' && payload && typeof payload === 'object') {
          const canPublish = this.checkTopicByAcl(payload.topic, this.item.settings.aclTopics)
          if (canPublish) {
            const data = { topic: payload.topic, payload: payload.payload, settings: { retain: payload.retain } }
            console.log(data)
            this.$emit('action', data)
          }
        }
      }
    }
  },
  computed: {
    link () {
      if (this.item.settings.mode === IFRAME_MODE_INTEGRATION) {
        return this.item.settings.link
      } else {
        const urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#/%?=~_|!:,.;]*[a-z0-9-+&@#/%=~_|]/gim
        const topic = get(this.item, 'dataTopics[0].topicFilter')
        const payload = get(this.value, `['${topic}'].payload`, null)
        const linkValue = this.getValueByTopic(payload, this.item.dataTopics[0])
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
    },
    item: {
      deep: true,
      handler () {
        if (this.item.settings.initMessage) {
          this.send(this.item.settings.initMessage)
        }
      }
    },
    blocked (blocked) {
      this.send(`MQTTTiles|blocked=>${blocked}`)
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (!this.isReady && this.item.settings.readyMessage && e.data === this.item.settings.readyMessage) {
        if (this.item.settings.initMessage) {
          this.send(this.item.settings.initMessage)
        }
        this.isReady = true
        this.update()
        this.send(`MQTTTiles|blocked=>${this.blocked}`)
      } else {
        this.handleActionMessage(e.data)
      }
    })
  },
  mounted () {
    this.$nextTick(() => {
      if (this.item.settings.initMessage) {
        this.send(this.item.settings.initMessage)
      }
      if (!this.item.settings.readyMessage) { this.send(`MQTTTiles|blocked=>${this.blocked}`) }
    })
  },
  mixins: [getValueByTopic]
}
</script>
