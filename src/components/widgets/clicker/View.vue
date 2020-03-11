<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${item.color}-1`]">
      <q-btn
        :disabled="item.status === WIDGET_STATUS_DISABLED"
        size="0.8rem"
        dense
        round
        :icon="`mdi-${item.settings.icon || 'send'}`"
        :color="`${item.color}-7`"
      />
      <q-tooltip>Payload{{item.settings.payload ? `: ${item.settings.payload}` : ' is empty'}}</q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__informer q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-py-none q-px-sm" style="min-height: 0px;">
      <q-item-section class="ellipsis text-white" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
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
    <q-card-section :class="[`bg-${item.color}-1`]" class="widget__content clicker__payload q-py-none q-px-sm scroll" :style="{height: contentHeight}">
      <q-btn
        class="payload__button"
        :disabled="item.status === WIDGET_STATUS_DISABLED"
        :color="`${item.color}-7`"
        :label="item.settings.icon ? undefined : item.settings.label || 'Send'"
        :icon="item.settings.icon ? `mdi-${item.settings.icon}` : undefined"
        rounded
        @click="actionHandler"
      />
    </q-card-section>
  </q-card>
</template>

<style lang="stylus">
  .clicker__payload
    display inline-flex
    align-items center
    justify-content center
    vertical-align middle
    min-height 60px
    width 100%
    .payload__button
      width 100%
      .q-btn-inner div
        text-overflow ellipsis
        overflow hidden
        width 100%
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
export default {
  name: 'Clicker',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    actionTopic () {
      return this.item.settings.topic
    },
    contentHeight () {
      let height = 'calc(100% - 22px)'
      if (!this.item.name && this.blocked) { height = '100%' }
      return height
    }
  },
  methods: {
    actionHandler () {
      const data = { topic: this.actionTopic, payload: this.item.settings.payload, settings: { retain: this.item.settings.save } }
      this.$emit('action', data)
    }
  }
}
</script>
