<template>
  <div v-if="mini" style="text-align: center;">
    <div
      style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;"
      :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]"
    >
      <q-icon
        v-if="needShowIcon"
        size="3rem"
        :style="{color: activeItem.color}"
        :name="`mdi-${activeItem.icon || item.settings.defaultIcon}`"
      />
      <div v-else :style="{color: activeItem.color}" style="text-overflow: ellipsis;overflow: hidden;">{{activeItem.label}}</div>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else class="full-width full-height">
    <q-icon
      v-if="needShowIcon"
      :style="{color: activeItem.color, fontSize: `${size}rem`, height: activeItem.label && item.settings.isNeedShowTitles ? 'calc(100% - 25px)' : '100%'}"
      :name="`mdi-${activeItem.icon || item.settings.defaultIcon}`"
      style="width: 100%;"
    />
    <div v-else style="width: 100%; height: 100%;" class="flex flex-center" :style="{color: activeItem.color}">{{activeItem.label}}</div>
    <div v-if="activeItem.label && needShowIcon && item.settings.isNeedShowTitles" style="width: 100%;" class="flex flex-center ellipsis" :style="{color: activeItem.color}">{{activeItem.label}}</div>
  </div>
</template>

<style lang="stylus">
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
import get from 'lodash/get'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'StatusIndicator',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      DEFAULT_MODE,
      COMMAND_MODE,
      actionTopic: null,
      actionPayload: '',
      valueExpired: false,
      expireValueTimeoutId: 0
    }
  },
  computed: {
    needShowIcon () {
      return this.item.settings.defaultIcon || this.activeItem.icon || !this.activeItem.label
    },
    size () {
      const height = this.item.settings.height,
        width = this.item.settings.width,
        active = height > width ? width : height
      const mul = this.activeItem.label && this.needShowIcon && this.item.settings.isNeedShowTitles ? 2 : 2.5
      return active * mul
    },
    currentValue: {
      get () {
        const topic = get(this.item, 'dataTopics[0].topicFilter')
        const value = get(this.value, `['${topic}'].payload`, null)
        if (this.item.settings.resetTimeout) {
          this.setExpireLogic()
        } else {
          this.clearExpireLogic()
        }
        if (this.valueExpired) {
          return null
        } else {
          return this.mathProcessing(this.getValueByTopic(value, this.item.dataTopics[0]), this.item.settings.math)
        }
      },
      set (val) {
        this.setAction(val)
        this.actionHandler()
      }
    },
    activeItem () {
      const defaultItem = this.item.settings.items[0]
      const activeItem = this.item.settings.items.slice(1).filter(item => item.val === this.mathProcessing(this.currentValue, item.math))
      return activeItem[0] || defaultItem
    },
    contentHeight () {
      let height = 'calc(100% - 22px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 4px)'
      }
      return height
    }
  },
  methods: {
    setAction (val) {
      let topic = '',
        payload = ''
      if (this.item.settings.mode === DEFAULT_MODE) {
        topic = this.item.dataTopics[0].topicFilter
        payload = val
      } else {
        const currentItem = this.item.settings.items.filter(item => item.val === val)[0]
        topic = currentItem.actionTopic
        payload = currentItem.actionPayload
      }
      this.actionTopic = topic
      this.actionPayload = payload
    },
    actionHandler () {
      if (this.actionTopic !== null) {
        const data = { topic: this.actionTopic, payload: this.actionPayload, settings: { retain: this.item.settings.save } }
        this.$emit('action', data)
      }
    },
    setExpireLogic () {
      if (this.expireValueTimeoutId) {
        clearTimeout(this.expireValueTimeoutId)
        this.expireValueTimeoutId = 0
      }
      const now = Date.now(),
        expiredTime = this.time + this.item.settings.resetTimeout * 1000
      if (now > expiredTime) {
        this.valueExpired = true
      } else {
        this.valueExpired = false
        this.expireValueTimeoutId = setTimeout(() => {
          this.valueExpired = true
        }, expiredTime - now)
      }
    },
    clearExpireLogic () {
      this.valueExpired = false
      if (this.expireValueTimeoutId) {
        clearTimeout(this.expireValueTimeoutId)
        this.expireValueTimeoutId = 0
      }
    }
  },
  mixins: [getValueByTopic, timestamp, formatValue]
}
</script>
