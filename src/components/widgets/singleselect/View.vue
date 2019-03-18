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
    <q-item class="q-pa-none" style="min-height: 22px;">
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
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 22px);">
      <q-list style="height: 100%; overflow: auto;" no-border>
        <q-item tag="label" v-for="(listItem, index) in item.settings.items" :key="`${index}${listItem.value}`">
          <q-item-side>
            <q-radio v-model="currentValue" :val="listItem.val" :color="`${item.color}-7`" />
          </q-item-side>
          <q-item-main class="cursor-pointer">
            <q-item-tile label>{{listItem.label || listItem.val}}<span class="text-grey-7 q-ml-xs" v-if="listItem.label">({{listItem.val || '*Empty*'}})</span></q-item-tile>
            <q-item-tile v-if="item.settings.mode === COMMAND_MODE" sublabel>{{listItem.actionTopic}}</q-item-tile>
            <q-item-tile v-if="item.settings.mode === COMMAND_MODE" sublabel>({{listItem.actionPayload || '*Empty*'}})</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-media>
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
      let value = this.value[this.item.dataTopics[0].topicFilter]
      if (value === null) {
        return 'N/A'
      } else {
        return this.item.settings.items.filter(item => item.val === this.currentValue)[0].label
      }
    },
    stringLength () {
      return this.currentLabel.length
    },
    currentValue: {
      get () {
        let value = this.value[this.item.dataTopics[0].topicFilter]
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
        let currentItem = this.item.settings.items.filter(item => item.val === val)[0]
        topic = currentItem.actionTopic
        payload = currentItem.actionPayload
      }
      this.actionTopic = topic
      this.actionPayload = payload
    },
    actionHandler () {
      if (this.actionTopic !== null) {
        let data = {topic: this.actionTopic, payload: this.actionPayload, settings: {retain: this.item.settings.save}}
        this.$emit('action', data)
      }
    }
  },
  mixins: [getValueByTopic]
}
</script>
