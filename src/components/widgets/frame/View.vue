<template>
  <q-card flat inline class="widget__informer" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 29px;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
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
        <div class="informer__payload" style="height: 100%">
          <q-resize-observable @resize="onResize" />
          <iframe v-if="link !== null" :src="link" frameborder="0" :height="height" :width="width" autoplay></iframe>
          <div v-else style="height: 95%;" class="bg-grey-5 text-grey-8 relative-position q-pt-xs">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
              <q-icon name="mdi-block-helper" :size="`${height / 2}px`"/>
            </div>
            <div style="font-size: 1.5rem;">Invalid link address</div>
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
export default {
  name: 'Frame',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    return {
      width: 0,
      height: 0
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    },
    onResize ({width, height}) {
      this.width = width - 16
      this.height = height - 16
    }
  },
  computed: {
    link () {
      let urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#/%?=~_|!:,.;]*[a-z0-9-+&@#/%=~_|]/gim
      let linkValue = this.value[Object.keys(this.value)[0]]
      return linkValue && linkValue.toString().match(urlPattern) ? linkValue : null
    }
  }
}
</script>
