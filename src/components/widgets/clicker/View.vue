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
  <q-card v-else inline class="widget__informer" style="width: 100%; height: 100%;">
    <q-item class="q-py-none q-px-sm" :class="[`bg-${item.color}-7`]">
      <q-item-main class="ellipsis text-white">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <q-item-side>
        <q-btn v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" round dense flat :color="inShortcuts ? 'yellow' : 'white'">
          <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
        </q-btn>
        <q-btn round dense flat icon="mdi-dots-vertical" color="white">
          <q-popover anchor="bottom right" self="top right">
            <q-list dense>
              <q-item v-if="item.settings.width === 1" class="cursor-pointer" v-close-overlay highlight @click.native="$emit('fast-bind')">
                <q-item-side :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" :color="inShortcuts ? 'yellow-9' : 'dark'"/>
                <q-item-main :label="`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`"/>
              </q-item>
              <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('update')">
                <q-item-side icon="mdi-settings" />
                <q-item-main label="Edit"/>
              </q-item>
              <q-item-separator/>
              <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('delete')">
                <q-item-side color="red" icon="mdi-delete-outline" />
                <q-item-main label="Remove"/>
              </q-item>
            </q-list>
          </q-popover>
        </q-btn>
      </q-item-side>
    </q-item>
    <q-card-media :class="[`bg-${item.color}-1`]" class="widget__content clicker__payload q-px-sm" style="height: calc(100% - 40px);">
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
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'Clicker',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value'],
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
