<template>
  <div class="dash__board">
    <q-resize-observable @resize="onResize" />
    <settings
      v-if="settingsModel"
      v-model="settingsModel"
      :settings="currentSettings"
      :mode="operationMode"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-btn v-if='!board.settings.blocked  && !isFrized' fab color="dark" @click="addWidgetHandler" icon="mdi-plus" class="absolute button--add">
      <q-tooltip>Add new widget</q-tooltip>
    </q-btn>
    <q-toolbar color="white">
      <q-btn round flat color="dark" icon="mdi-arrow-left" @click="$emit('close')" v-if="!isFrized">
        <q-tooltip>Back to boards list</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-dark">{{board.name}}</q-toolbar-title>
      <q-btn v-if="canShare" @click="shareHandler" icon="mdi-share" color="dark" flat round>
        <q-tooltip>Share board</q-tooltip>
      </q-btn>
      <q-btn v-if="canShare" @click="uploadHandler" icon="mdi-upload" color="dark" flat round>
        <q-tooltip>Upload board</q-tooltip>
      </q-btn>
      <q-btn @click="$emit('block')" :icon="board.settings.blocked ? 'mdi-lock' : 'mdi-lock-open'" color="dark" flat round v-if="!isFrized">
        <q-tooltip>{{board.settings.blocked ? 'Unlock your board' : 'Lock your board'}}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <div class="widgets__wrapper scroll">
      <div style="width: 100%; position: relative;" v-if="board.widgetsIndexes.length">
        <grid-layout
          ref="grid"
          :layout.sync="currentLayout"
          :col-num="colNum"
          :row-height="rowHeight"
          :is-draggable="!board.settings.blocked && !isFrized"
          :is-resizable="!board.settings.blocked && !isFrized"
          :is-mirrored="false"
          :vertical-compact="false"
          :margin="[10, 10]"
          :use-css-transforms="true"
          :responsive="true"
        >
            <grid-item v-for="(widgetIndex, index) in board.widgetsIndexes"
              :key="widgetIndex"
              :x="currentLayout[index].x"
              :y="currentLayout[index].y"
              :w="currentLayout[index].w"
              :h="currentLayout[index].h"
              :i="currentLayout[index].i"
              :minW="widgets[widgetIndex].settings.minWidth || 1"
              :minH="widgets[widgetIndex].settings.minHeight || 1"
              dragIgnoreFrom=".widget__content, i, button, a"
              @resized="resizeHandler"
            >
              <component
                class="wrapper__items"
                :class="{'wrapper__items--edited': !board.settings.blocked && !isFrized}"
                :is="widgets[widgetIndex].type"
                :item="widgets[widgetIndex]"
                :value="values[widgetIndex]"
                :index="widgetIndex"
                :in-shortcuts="Boolean(board.shortcutsIndexes.includes(widgetIndex))"
                :blocked="board.settings.blocked || isFrized"
                @action="(data) => { $emit('action', data) }"
                @update="editWidgetSettings(widgetIndex)"
                @duplicate="duplicateWidgetHandler(widgetIndex)"
                @delete="$emit('delete:widget', {widgetId: widgetIndex, settings: widgets[widgetIndex]})"
                @fast-bind="$emit('fast-bind', widgetIndex)"
              />
            </grid-item>
        </grid-layout>
      </div>
      <div v-else class="text-center text-grey-8 q-mt-md" style="font-size: 2rem;">
        <div class="text-bold">The board is empty</div>
        <div><q-btn color="dark" icon="mdi-plus-circle-outline" label="Add widget" @click="addWidgetHandler" /></div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .wrapper__items
    border 1px solid #ccc
  .wrapper__items--edited
    border 1px solid transparent
    box-shadow 0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12)!important
  .button--add
    bottom 16px
    right 16px
    z-index 1
  .dash__board
    position relative
    .widgets__wrapper
      height calc(100% - 50px)
      padding-bottom 82px
      position relative
</style>

<script>
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import Settings from './widgets/Settings'
import VueGridLayout from 'vue-grid-layout'
import Switcher from './widgets/switcher/View'
import Informer from './widgets/informer/View'
import StaticInformer from './widgets/staticInformer/View'
import MultiInformer from './widgets/multiInformer/View'
import Clicker from './widgets/clicker/View'
import Radial from './widgets/radial/View'
import Linear from './widgets/linear/View'
import Frame from './widgets/frame/View'
import Singleselect from './widgets/singleselect/View'
import Multiplier from './widgets/multiplier/View'
import Complex from './widgets/complex/View'
import Slider from './widgets/slider/View'
import Color from './widgets/color/View'
import { WIDGET_MODE_EDIT, WIDGET_MODE_ADD, WIDGET_MODE_DUPLICATE } from '../constants'

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
function getBreakpoint (width) {
  width = width || window.innerWidth
  let breakpoints = ['xxs', 'xs', 'sm', 'md', 'lg']
  return breakpoints.reduce((breakpoint, current) => {
    if (width > BREAKPOINTS[current]) {
      return current
    } else {
      return breakpoint
    }
  }, null)
}

export default {
  name: 'Board',
  props: ['board', 'widgets', 'values', 'canShare', 'isFrized', 'hasConnection'],
  data () {
    return {
      settingsModel: false,
      currentSettings: undefined,
      editedWidgetId: undefined,
      editedWidgetTopics: undefined,
      colNum: 12,
      rowHeight: 50,
      breakpoints: BREAKPOINTS,
      breakpoint: 'xxs',
      operationMode: -1
    }
  },
  computed: {
    currentLayout: {
      get () {
        return this.board.layouts[this.breakpoint]
      },
      set (layout) {
        if (this.breakpoint !== this.$refs.grid && this.$refs.grid.lastBreakpoint) { return false }
        this.$emit('update:layout', {layout, breakpoint: this.breakpoint})
      }
    }
  },
  methods: {
    openSettings () {
      this.settingsModel = true
    },
    hideSettingsHandler () {
      this.currentSettings = undefined
      this.editedWidgetId = undefined
      this.editedWidgetTopics = undefined
    },
    saveSettingsHandler (settings) {
      if (this.editedWidgetId !== undefined) {
        this.$emit('edit:widget', {settings, widgetId: this.editedWidgetId, topics: this.editedWidgetTopics})
      } else {
        this.$emit('add:widget', settings)
      }
      this.operationMode = -1
    },
    addWidgetHandler () {
      this.operationMode = WIDGET_MODE_ADD
      this.openSettings()
    },
    editWidgetSettings (widgetId) {
      this.currentSettings = this.widgets[widgetId]
      this.editedWidgetId = widgetId
      this.editedWidgetTopics = [...this.currentSettings.topics]
      this.operationMode = WIDGET_MODE_EDIT
      this.openSettings()
    },
    resizeHandler (index, height, width) {
      this.$emit('resized', { index, height, width })
    },
    onResize ({width}) { this.breakpoint = getBreakpoint(width) },
    shareHandler () {
      this.$emit('share')
    },
    uploadHandler () {
      this.$emit('upload')
    },
    duplicateWidgetHandler (widgetId) {
      this.currentSettings = cloneDeep(this.widgets[widgetId])
      Vue.delete(this.currentSettings, 'id')
      this.operationMode = WIDGET_MODE_DUPLICATE
      this.openSettings()
    }
  },
  components: {
    Settings,
    Switcher,
    Informer,
    MultiInformer,
    StaticInformer,
    Clicker,
    Radial,
    Linear,
    Frame,
    Singleselect,
    Multiplier,
    Complex,
    Slider,
    Color,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  }
}
</script>
