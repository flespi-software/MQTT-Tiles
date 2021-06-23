<template>
  <div>
    <div v-if="Object.keys(boards).length" class="remote-control text-center">
      <span @click="$emit('input', !value)" class="remote-control__button text-grey-9 bg-orange q-px-sm text-bold text-uppercase cursor-pointer shadow-3">{{value ? 'hide' : 'saved boards'}}</span>
    </div>
    <transition
      appear
      enter-active-class="animated slideInDown"
      leave-active-class="animated slideOutUp"
    >
      <div class="relative-position boards__remote bg-grey-3 flex no-wrap" v-if="Object.keys(boards).length && value">
        <q-btn v-if="scrollPosition > 0" @click="scrollLeft" icon="mdi-chevron-left" dense flat class="slider-controls absolute-top-left absolute-bottom-left"/>
        <div class="flex no-wrap overflow-hidden q-pb-md q-pt-lg boards__remote-wrapper" ref="wrapper">
          <q-resize-observer @resize="onResize"/>
          <q-intersection
            v-for="(board, id) in boards" :key="`remote-${id}`"
            transition="flip-right"
            class="q-my-xs q-px-sm q-my-sm remote__board"
          >
            <q-card>
              <q-item class="q-py-none q-pl-sm q-pr-none bg-grey-4" style="min-height: 20px;">
                <q-item-section class="ellipsis">
                  <div class="ellipsis" style="height: 24px; line-height: 24px;">
                    {{board.name || '*No name*'}}
                    <q-tooltip v-if="board.name">{{board.name}}</q-tooltip>
                  </div>
                  <div class="ellipsis text-grey-9" style="height: 14px; line-height: 14px; font-size: 14px;">
                    {{board.id}}
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn round dense flat icon="mdi-dots-vertical" color="grey-9">
                    <q-menu anchor="bottom right" self="top right">
                      <q-list dense>
                        <q-item v-close-popup @click.stop="$emit('share-uploaded', id)" :disable="!canShare" clickable>
                          <q-item-section avatar>
                            <q-icon name="mdi-link"/>
                          </q-item-section>
                          <q-item-section>Get link</q-item-section>
                        </q-item>
                        <q-separator/>
                        <q-item v-close-popup @click.stop="$emit('delete-uploaded', id)" clickable>
                          <q-item-section avatar>
                            <q-icon name="mdi-delete-outline" color="red"/>
                          </q-item-section>
                          <q-item-section>Remove</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section class="text-center relative-position">
                <div v-if="board.settings.lastModify" class="absolute-top-right text-grey-5 q-pr-xs" style="font-size: .7rem;">{{date(board.settings.lastModify, 'DD-MM-YYYY HH:mm:ss')}}</div>
                <q-icon name="mdi-download" size="20px" color="grey-9" class="cursor-pointer" @click.native="$emit('import', id)" />
                <span class="text-grey-5 absolute" style="font-size: 10px; bottom: 4px; left: 4px; cursor: default;" v-if='board.appVersion' title="MQTT Tiles version">v.{{board.appVersion}}</span>
                <span class="text-bold text-white absolute bg-purple-6 rounded-borders q-px-xs" style="font-size: 10px; bottom: 4px; right: 4px; cursor: default;" title="Widgets count">{{board.widgetsIndexes.length}}</span>
              </q-card-section>
            </q-card>
          </q-intersection>
        </div>
        <q-btn v-if="scrollPosition < wrapperWidth" @click="scrollRight" icon="mdi-chevron-right" dense flat class="slider-controls absolute-top-right absolute-bottom-right"/>
      </div>
    </transition>
  </div>
</template>

<script>
import { date } from 'quasar'
export default {
  props: ['boards', 'canShare', 'value'],
  data () {
    return {
      scrollPosition: 0,
      wrapperWidth: 0,
      wrapperClientWidth: 0
    }
  },
  methods: {
    date: date.formatDate,
    scrollLeft () {
      this.$refs.wrapper.scrollLeft -= this.wrapperClientWidth - 100
      this.scrollPosition = this.$refs.wrapper.scrollLeft
    },
    scrollRight () {
      this.$refs.wrapper.scrollLeft += this.wrapperClientWidth - 100
      this.scrollPosition = this.$refs.wrapper.scrollLeft
    },
    onResize (d) {
      const el = this.$refs.wrapper
      this.wrapperWidth = el.scrollWidth - el.offsetWidth
      this.wrapperClientWidth = el.offsetWidth
    }
  }
}
</script>

<style lang="sass" scoped>
  .slider-controls
    z-index: 1
    background-color: rgba(255, 255, 255, .7)
  .boards__remote
    max-height: 149px
    box-shadow: rgba(0, 0, 0, 0.7) 0px -9px 9px -9px inset
    .remote__board
      width: 200px
      min-width: 200px
  .remote-control
    position: absolute
    right: 0
    left: 0
    font-size: 13px
    height: 15px
    z-index: 1
    line-height: 15px
    .remote-control__button
      border-radius: 0px 0px 5px 5px
      line-height: 15px
</style>
