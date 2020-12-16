<template>
  <div v-if="mini" style="text-align: center;">
    <div
      style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;"
      :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]"
    >
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        {{`${currentLabel}`}}
      </div>
      <q-tooltip ref="tooltip">
        {{`${currentLabel} (${currentValue})`}}
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__switcher q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-pa-none" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <div>
            <q-btn size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
              <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
            </q-btn>
            <q-btn size="0.7rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
              <q-menu anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
                <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                  <q-btn v-close-popup v-if="item.settings.width === 1" size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" dense flat :color="inShortcuts ? 'yellow-9' : `${item.color}-7`">
                    <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
                  </q-btn>
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
    <q-card-section class="widget__content q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <q-list style="height: 100%; overflow: auto;">
        <q-item tag="label" v-for="(listItem, index) in item.settings.items" :key="`${index}${listItem.value}`" class="q-pa-none q-mb-xs">
          <q-item-section avatar>
            <q-radio v-model="currentValue" :val="listItem.val" :color="`${item.color}-7`" />
          </q-item-section>
          <q-item-section class="cursor-pointer">
            <q-item-label>{{listItem.label || listItem.val || 'Empty'}}</q-item-label>
            <q-item-label v-if="item.settings.mode === COMMAND_MODE" caption>{{listItem.actionTopic}}</q-item-label>
            <q-item-label v-if="item.settings.mode === COMMAND_MODE" caption>({{listItem.actionPayload || '*Empty*'}})</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px; bottom: 1px; left: 1px; user-select: none;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
      {{timestamp}}
    </div>
  </q-card>
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
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'Singleselect',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      DEFAULT_MODE,
      COMMAND_MODE,
      actionTopic: null,
      actionPayload: ''
    }
  },
  computed: {
    currentLabel () {
      const value = this.value[this.item.dataTopics[0].topicFilter] && this.value[this.item.dataTopics[0].topicFilter].payload
      if (value === null) {
        return 'N/A'
      } else {
        const activeVal = this.item.settings.items.filter(item => item.val === this.currentValue)[0]
        return activeVal ? activeVal.label : 'N/A'
      }
    },
    stringLength () {
      return this.currentLabel.length
    },
    currentValue: {
      get () {
        const value = this.value[this.item.dataTopics[0].topicFilter] && this.value[this.item.dataTopics[0].topicFilter].payload
        if (value === null) {
          return null
        } else {
          return this.getValueByTopic(value, this.item.dataTopics[0])
        }
      },
      set (val) {
        this.setAction(val)
        this.actionHandler()
      }
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
    }
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
