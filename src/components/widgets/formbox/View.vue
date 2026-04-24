<template>
  <div class="formbox__wrapper" style="width: 100%; height: 100%;">
    <q-resize-observer @resize="onResize"/>
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      frameborder="0"
      :height="height"
      :width="width"
      ref="frame"
      allowfullscreen
    ></iframe>
    <div v-else class="bg-grey-5 text-grey-8 relative-position full-height">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1rem;">
        FormBox URL is not set
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .formbox__wrapper
    overflow hidden
</style>

<script>
import JSONPath from 'jsonpath'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import { SCHEMA_MODE_TOPIC } from './constants'
export default {
  name: 'Formbox',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      width: 0,
      height: 0,
      isReady: false,
      lastSentCmd: null,
      messageHandler: null
    }
  },
  computed: {
    iframeUrl () {
      return this.item.settings.iframeUrl
    },
    dataTopic () {
      return (this.item.settings.topics && this.item.settings.topics[0]) || null
    },
    schemaTopic () {
      return (this.item.settings.topics && this.item.settings.topics[1]) || null
    }
  },
  methods: {
    onResize ({ width, height }) {
      this.width = width
      this.height = height
    },
    send (msg) {
      if (this.$refs.frame && this.$refs.frame.contentWindow) {
        this.$refs.frame.contentWindow.postMessage(msg, '*')
      }
    },
    getTopicValue (topic) {
      if (!topic || !topic.topicFilter) { return null }
      const payload = get(this.value, `['${topic.topicFilter}'].payload`, null)
      if (payload === null || payload === undefined) { return null }
      const parsed = this.getValueByTopic(payload, topic)
      return (parsed && typeof parsed === 'object') ? parsed : null
    },
    getSchema () {
      if (this.item.settings.schemaMode === SCHEMA_MODE_TOPIC) {
        const extracted = this.getTopicValue(this.schemaTopic)
        return (extracted && !Array.isArray(extracted)) ? extracted : null
      }
      return this.item.settings.schema || null
    },
    getFormData () {
      const extracted = this.getTopicValue(this.dataTopic)
      return (extracted && !Array.isArray(extracted)) ? extracted : null
    },
    update () {
      if (!this.isReady) { return }
      const schema = this.getSchema()
      if (!schema || !Object.keys(schema).length) { return }
      const data = this.getFormData()
      const cmd = {
        schema,
        applybtn: this.item.settings.readonly ? '' : 'send'
      }
      if (data) { cmd.data = data }
      if (isEqual(cmd, this.lastSentCmd)) { return }
      this.lastSentCmd = cloneDeep(cmd)
      this.send('FormBox|cmd:' + JSON.stringify(cmd))
    },
    handleMessage (event) {
      const raw = event.data
      if (typeof raw !== 'string' || raw.indexOf('FormBox|') !== 0) { return }
      const rest = raw.substring('FormBox|'.length)
      const sepIdx = rest.indexOf(':')
      if (sepIdx === -1) { return }
      const type = rest.substring(0, sepIdx)
      const body = rest.substring(sepIdx + 1)
      let parsed = null
      try { parsed = JSON.parse(body) } catch (e) { return }
      if (type === 'state' && parsed && parsed.ready) {
        this.isReady = true
        this.lastSentCmd = null
        this.update()
        return
      }
      if (this.item.settings.readonly) { return }
      if (type === 'data' && parsed && typeof parsed === 'object') {
        this.publish(parsed)
      }
    },
    buildPayload (formData) {
      const template = this.item.settings.publishTemplate
      const topic = this.dataTopic
      if (template) {
        const currentPayload = topic ? get(this.value, `['${topic.topicFilter}'].payload`, null) : null
        const currentValue = currentPayload !== null ? this.getCleanValue(currentPayload, topic) : null
        const topicFilter = (topic && topic.topicFilter) || ''
        const parts = topicFilter.split('/')
        let payload = template
        payload = payload.replace(/<\{form\}>/g, JSON.stringify(formData))
        payload = payload.replace(/<\{topic\}>/g, topicFilter)
        payload = payload.replace(/<\{topic\[(\d+)\]\}>/g, (_, idx) => parts[idx] || '')
        payload = payload.replace(/<\{payload\}>/g, () => (currentValue === null || currentValue === 'N/A') ? '' : (typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue)))
        payload = payload.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (_, name) => {
          return JSON.stringify(get(formData, name, null))
        })
        return payload
      }
      if (topic && topic.payloadField) {
        const currentPayload = get(this.value, `['${topic.topicFilter}'].payload`, null)
        const full = currentPayload !== null ? this.getCleanValue(currentPayload, { ...topic, payloadField: '' }) : null
        if (full && typeof full === 'object' && full !== 'N/A') {
          try {
            JSONPath.apply(full, topic.payloadField, () => formData)
            return JSON.stringify(full)
          } catch (e) { /* fall through */ }
        }
      }
      return JSON.stringify(formData)
    },
    publish (formData) {
      const topic = this.dataTopic
      if (!topic || !topic.topicFilter) { return }
      this.$emit('action', {
        topic: topic.topicFilter,
        payload: this.buildPayload(formData),
        settings: { retain: !!this.item.settings.save }
      })
    }
  },
  watch: {
    value: {
      deep: true,
      handler () { this.update() }
    },
    'item.settings.schema': {
      deep: true,
      handler () {
        this.lastSentCmd = null
        this.update()
      }
    },
    'item.settings.schemaMode' () {
      this.lastSentCmd = null
      this.update()
    },
    'item.settings.readonly' () {
      this.lastSentCmd = null
      this.update()
    },
    iframeUrl () {
      this.isReady = false
      this.lastSentCmd = null
    }
  },
  created () {
    this.messageHandler = (e) => this.handleMessage(e)
    window.addEventListener('message', this.messageHandler)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.messageHandler)
  },
  mixins: [getValueByTopic]
}
</script>
