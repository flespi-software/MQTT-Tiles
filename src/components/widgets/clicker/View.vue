<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]">
      <q-btn
        :disabled="item.status === WIDGET_STATUS_DISABLED"
        size="0.8rem"
        dense
        round
        icon="mdi-send"
        :color="currentValue !== null ? `${item.color}-7` : `${item.color}-4`"
      />
      <q-tooltip>Payload{{item.settings.payload ? `: ${item.settings.payload}` : ' is empty'}}</q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card flat v-else inline class="widget__informer q-pa-sm" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-py-none q-px-sm" style="min-height: 22px;">
      <q-item-main class="ellipsis text-white" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
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
    <q-card-media :class="[`bg-${item.color}-1`]" class="widget__content clicker__payload q-px-sm" style="height: calc(100% - 22px);">
      <q-btn
        class="payload__button"
        :disabled="item.status === WIDGET_STATUS_DISABLED"
        :color="`${item.color}-${currentValue === null ? 4 : 7}`"
        :label="item.settings.label || 'Send'"
        rounded
        @click="actionHandler"
      />
    </q-card-media>
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
    currentValue () {
      return this.value[this.item.topics[0]]
    }
  },
  methods: {
    actionHandler () {
      let data = {topic: this.item.topics[0], payload: this.item.settings.payload, settings: {retain: this.item.settings.save}}
      this.$emit('action', data)
    }
  }
}
</script>
