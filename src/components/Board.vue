<template>
  <div class="dash__board">
    <q-resize-observable @resize="onResize" />
    <settings
      v-if="settingsModel"
      v-model="settingsModel"
      :settings="currentSettings"
      :board="board"
      :mode="operationMode"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-btn v-if='!board.settings.blocked  && !isFrized' fab color="dark" @click="addWidgetHandler" icon="mdi-plus" class="absolute button--add">
      <q-tooltip>Add new widget</q-tooltip>
    </q-btn>
    <q-toolbar color="white" v-if="(isFrized && board.name) || !isFrized">
      <q-btn round flat color="dark" icon="mdi-arrow-left" @click="$emit('close')" v-if="!isFrized">
        <q-tooltip>Back to boards list</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-dark">{{board.name || '*No name*'}}</q-toolbar-title>
      <q-btn v-if="canShare" @click="shareHandler" icon="mdi-link" color="dark" flat round>
        <q-tooltip>Get link</q-tooltip>
      </q-btn>
      <q-btn v-if="canShare" @click="uploadHandler" icon="mdi-cloud-upload-outline" color="dark" flat round>
        <q-tooltip>Upload board</q-tooltip>
      </q-btn>
      <q-btn @click="preventCollisionBoardHandler" :icon="board.settings.preventCollision ? 'mdi-pin' : 'mdi-pin-outline'" color="dark" flat round v-if="!isFrized && !board.settings.blocked">
        <q-tooltip>{{board.settings.preventCollision ? 'Unlock widgets positions' : 'Lock widgets positions'}}</q-tooltip>
      </q-btn>
      <q-btn @click="blockBoardHandler" :icon="board.settings.blocked ? 'mdi-lock' : 'mdi-lock-open'" color="dark" flat round v-if="!isFrized">
        <q-tooltip>{{board.settings.blocked ? 'Unlock your board' : 'Lock your board'}}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-toolbar color="white" class="q-py-none" style="flex-wrap: wrap" v-if="board.settings.variables && board.settings.variables.length">
      <q-resize-observable @resize="onVariablesWrapperResize" />
      <div v-for="(variable, varIndex) in board.settings.variables" :key="variable.name" class="q-mr-sm">
        <div class="text-grey-6" style="font-size: .8rem;">{{variable.name}}</div>
        <q-item class="no-padding" style="min-height: 35px;">
          <q-item-main>
            <q-item-tile label class="ellipsis overflow-hidden text-dark" :style="{maxWidth: '140px'}">
              {{(variablesListValues[varIndex][board.activeVariables[variable.name]] && variablesListValues[varIndex][board.activeVariables[variable.name]].label) || `*empty*`}}
            </q-item-tile>
          </q-item-main>
          <q-item-side style="min-width: 25px;">
            <q-item-tile
              style="display: inline-block"
              stamp
              size="2rem"
              v-if="variablesListValues[varIndex][board.activeVariables[variable.name]] && variablesListValues[varIndex][board.activeVariables[variable.name]].value != variablesListValues[varIndex][board.activeVariables[variable.name]].label"
            >
              {{(variablesListValues[varIndex][board.activeVariables[variable.name]] && variablesListValues[varIndex][board.activeVariables[variable.name]].value) || ''}}
            </q-item-tile>
            <q-item-tile style="display: inline-block" stamp size="2rem" icon="mdi-menu-down" />
          </q-item-side>
          <q-popover fit ref="popoverActive">
            <q-list link separator class="scroll q-py-none" v-if="$refs.popoverActive && $refs.popoverActive[varIndex].showing">
              <VirtualList
                :size="40"
                :remain="variablesListValues[varIndex].length > 6 ? 6 : variablesListValues[varIndex].length"
              >
                <q-item
                  v-for="(variableModel, index) in variablesListValues[varIndex]"
                  :key="index"
                  v-close-overlay
                  @click.native="changeVaribleHandler(variable.name, variableModel.value), $refs.popoverActive[varIndex].hide()"
                  class="cursor-pointer"
                  :class="{'bg-grey-3': variableModel.value === board.activeVariables[variable.name]}"
                  highlight
                >
                  <q-item-main>
                    <q-item-tile label class="ellipsis overflow-hidden">{{variableModel.label}}</q-item-tile>
                  </q-item-main>
                  <q-item-side v-if="variableModel.label != variableModel.value">
                    <q-item-tile label class="ellipsis overflow-hidden">{{variableModel.value}}</q-item-tile>
                  </q-item-side>
                </q-item>
              </VirtualList>
            </q-list>
          </q-popover>
        </q-item>
      </div>
    </q-toolbar>
    <div class="widgets__wrapper scroll" :style="{height: wrapperHeight}" :class="{'q-px-sm': $q.platform.is.mobile}">
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
          :prevent-collision="board.settings.preventCollision"
        >
            <grid-item
              v-for="(widgetIndex, index) in board.widgetsIndexes"
              :key="widgetIndex"
              :x="currentLayout[index].x"
              :y="currentLayout[index].y"
              :w="currentLayout[index].w"
              :h="currentLayout[index].h"
              :i="currentLayout[index].i"
              :minW="widgets[widgetIndex].settings.minWidth || 1"
              :minH="widgets[widgetIndex].settings.minHeight || 1"
              dragIgnoreFrom=".widget__content"
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
                @action="actionHandler"
                @update="editWidgetSettings(widgetIndex)"
                @duplicate="duplicateWidgetHandler(widgetIndex)"
                @delete="deleteWidgetHandler(widgetIndex)"
                @fast-bind="fastBindHandler(widgetIndex)"
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
  .variable-selector
    .q-if-inner
      text-overflow ellipsis
      white-space nowrap
      overflow hidden
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
      padding-bottom 82px
      position relative
</style>

<script>
import Vue from 'vue'
import VirtualList from 'vue-virtual-scroll-list'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'
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
import StatusIndicator from './widgets/statusIndicator/View'
import MapLocation from './widgets/mapLocation/View'
import MapRoute from './widgets/mapRoute/View'
import TextSender from './widgets/textSender/View'
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
  props: ['board', 'widgets', 'values', 'canShare', 'isFrized', 'hasConnection', 'variablesValues'],
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
      operationMode: -1,
      variablesWrapperHeight: 0
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
    },
    wrapperHeight () {
      let subtrahend = 0
      if (this.board.settings.variables && this.board.settings.variables.length) {
        subtrahend += this.variablesWrapperHeight
      }
      if ((this.isFrized && this.board.name) || !this.isFrized) {
        subtrahend += 50
      }
      return `calc(100% - ${subtrahend}px)`
    },
    variablesListValues () {
      return this.board.settings.variables.map(variable => {
        let variablesListValues = {}
        if (!variable.type || variable.type === 0) {
          variablesListValues = variable.values.reduce((result, varValue) => {
            let { label, value } = this.getVariableModel(varValue)
            result[value] = { label, value }
            return result
          }, {})
          Object.defineProperty(variablesListValues, 'length', { enumerable: false, value: variable.values.length })
        } else if (variable.type === 1) {
          let varKeys = Object.values(this.variablesValues[variable.name] || {})
          variablesListValues = this.naturalSort(varKeys).reduce((result, varValue) => {
            let { label, value } = this.getVariableModel(varValue)
            result[value] = { label, value }
            return result
          }, {})
          Object.defineProperty(variablesListValues, 'length', { enumerable: false, value: varKeys.length })
        }
        return variablesListValues
      })
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
      settings = this.modifyWidgetByVariables(settings)
      if (this.editedWidgetId !== undefined) {
        this.$emit('edit:widget', {settings, widgetId: this.editedWidgetId, topics: this.editedWidgetTopics})
      } else {
        this.$emit('add:widget', settings)
      }
      this.operationMode = -1
      this.setLastModifyBoard()
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
      this.setLastModifyBoard()
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
    },
    deleteWidgetHandler (widgetIndex) {
      this.$emit('delete:widget', {widgetId: widgetIndex, settings: this.widgets[widgetIndex]})
      this.setLastModifyBoard()
    },
    fastBindHandler (widgetIndex) {
      this.$emit('fast-bind', widgetIndex)
      this.setLastModifyBoard()
    },
    blockBoardHandler () {
      this.$emit('block')
      this.setLastModifyBoard()
    },
    preventCollisionBoardHandler () {
      this.$emit('prevent')
      this.setLastModifyBoard()
    },
    setLastModifyBoard () {
      this.$emit('modify')
    },
    onVariablesWrapperResize ({height}) {
      this.variablesWrapperHeight = height
    },
    changeVaribleHandler (variableName, value) {
      /* write current value */
      this.board.activeVariables[variableName] = value
      /* modify all widgets */
      this.board.widgetsIndexes.forEach(widgetIndex => {
        let widget = cloneDeep(this.widgets[widgetIndex])
        widget = this.modifyWidgetByVariables(widget)
        this.$emit('edit:widget', {settings: widget, widgetId: widget.id, topics: [...this.widgets[widgetIndex].topics]})
      })
    },
    modifyWidgetByVariables (widget) {
      let modifyTopics = (topic) => {
        if (!topic.topicTemplate) {
          topic.topicTemplate = topic.topicFilter
        }
        let variables = this.board.activeVariables
        topic.topicFilter = topic.topicTemplate.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (match, name) => {
          return variables[name] || match
        })
      }
      let allTopics = []
      if (widget.dataTopics.length) {
        widget.dataTopics.forEach(modifyTopics)
        allTopics = [...allTopics, ...widget.dataTopics]
      }
      if (widget.settings.topics && widget.settings.topics.length) {
        widget.settings.topics.forEach(modifyTopics)
        allTopics = [...allTopics, ...widget.settings.topics]
      }
      widget.topics = uniq(allTopics.map(topic => topic.topicFilter))
      return widget
    },
    naturalSort (arr) {
      return arr.sort((a, b) => {
        a = typeof a === 'string' ? a.toLowerCase() : a
        b = typeof b === 'string' ? b.toLowerCase() : b
        if (a !== b) {
          let na = Number(a),
            ba = Number(b)
          if (na + '' === a && ba + '' === b) {
            return na - ba
          } else {
            return (a > b) ? 1 : -1
          }
        }
      })
    },
    actionHandler (data) {
      let variables = this.board.activeVariables
      data.topic = data.topic.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (match, name) => {
        return variables[name] || match
      })
      this.$emit('action', data)
    },
    getVariableModel (value) {
      let label, val
      if (Array.isArray(value)) {
        [label, val] = value
      } else {
        val = value
        label = value
      }
      label = typeof label === 'string' ? label : JSON.stringify(label)
      return {label, value: val}
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
    StatusIndicator,
    MapLocation,
    MapRoute,
    TextSender,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    VirtualList
  }
}
</script>
