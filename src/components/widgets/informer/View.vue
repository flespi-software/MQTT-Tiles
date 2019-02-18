<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${firstValue !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>{{`${firstValue}`}}<span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </div>
      <q-tooltip ref="tooltip">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
        {{`${firstValue}`}}
        <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__informer" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 29px;">
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
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 29px);">
      <div style="width: 100%; height: 100%;">
        <div class="informer__payload" :style="{height: `${blocked ? '100%' : 'calc(100% - 15px)'}`}">
          <div v-for="topic in Object.keys(value)" :key="topic" :class="[`text-${value[topic] !== null ? 'dark' : 'grey-5'}`]">
            <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
            {{valuesBySettings[topic]}}
            <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
            <q-tooltip>
              <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
              {{valuesBySettings[topic]}}
              <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
            </q-tooltip>
          </div>
        </div>
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .informer__payload
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
import { WIDGET_STATUS_DISABLED, WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../../../constants'
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
    },
    getValueBySettings (value) {
      if (value === null) {
        value = 'N/A'
      } else {
        switch (this.item.settings.payloadType) {
          case WIDGET_PAYLOAD_TYPE_STRING: {
            value = value.toString()
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            if (this.item.settings.payloadField) {
              value = JSON.parse(value.toString())[this.item.settings.payloadField] || 'N/A'
            } else {
              value = JSON.parse(value.toString())
            }
            break
          }
          default: { value = value.toString() }
        }
      }
      return value
    }
  },
  computed: {
    valuesBySettings () {
      return Object.keys(this.value).reduce((values, topic) => {
        values[topic] = this.getValueBySettings(this.value[topic])
        return values
      }, {})
    },
    firstValue () {
      return this.valuesBySettings[Object.keys(this.value)[0]]
    },
    stringLength () {
      return this.item.settings.prefix.length + this.firstValue.length + this.item.settings.postfix.length
    }
  }
}
</script>
