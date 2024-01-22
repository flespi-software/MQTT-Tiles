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
      <q-tooltip>{{ (item && item.settings && item.settings.topics && item.settings.topics.length) || 0}} msg. will be sent</q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <div v-else class="clicker__payload q-py-none q-px-sm">
    <q-btn
      class="payload__button"
      :disabled="item.status === WIDGET_STATUS_DISABLED"
      :color="`${item.color}-7`"
      :label="item.settings.icon ? undefined : item.settings.label || 'Send'"
      :icon="item.settings.icon ? `mdi-${item.settings.icon}` : undefined"
      rounded
      @click="actionHandler"
    />
  </div>
</template>

<style lang="stylus">
  .clicker__payload
    display inline-flex
    align-items center
    justify-content center
    vertical-align middle
    min-height 60px
    width 100%
    height 100%
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
  props: ['item', 'index', 'mini', 'value'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  methods: {
    actionHandler () {
      this.item.settings.topics.forEach((topic) => {
        const data = { topic: topic.topicTemplate, payload: topic.payload, settings: { retain: this.item.settings.save } }
        this.$emit('action', data)
      })
    }
  }
}
</script>
