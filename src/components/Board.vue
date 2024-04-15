<template>
  <div class="dash__board">
    <settings
      v-if="settingsModel"
      v-model="settingsModel"
      :settings="currentSettings"
      :board="board"
      :mode="operationMode"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-btn v-if='!board.settings.blocked  && !isFrized' fab :color="`${$theme}-9`" @click="addWidgetHandler" icon="mdi-plus" class="absolute button--add">
      <q-tooltip>Add new widget</q-tooltip>
    </q-btn>
    <q-toolbar :class="[`bg-${$theme}-2`]" v-if="(isFrized && board.name) || !isFrized">
      <q-btn round flat color="grey-9" icon="mdi-arrow-left" @click="$emit('close')" v-if="!isFrized">
        <q-tooltip>Back to boards list</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-grey-9">{{board.name || '*No name*'}}</q-toolbar-title>
      <template v-if="!isFrized">
        <q-btn @click="doneExport" label="export" color="green-9" flat v-if="exportEnabled">
          <q-tooltip>Export widgets</q-tooltip>
        </q-btn>
        <q-btn @click="share(shareHandler)" icon="mdi-link" flat round :color="`grey-${canShare ? 9 : 7}`" :ripple="!!canShare">
          <q-tooltip>Get link</q-tooltip>
        </q-btn>
        <q-btn @click="preventCollisionBoardHandler" :icon="board.settings.preventCollision ? 'mdi-pin' : 'mdi-pin-outline'" color="grey-9" flat round v-if="!board.settings.blocked">
          <q-tooltip>{{board.settings.preventCollision ? 'Unlock widgets positions' : 'Lock widgets positions'}}</q-tooltip>
        </q-btn>
        <q-btn @click="blockBoardHandler" :icon="board.settings.blocked ? 'mdi-lock' : 'mdi-lock-open'" color="grey-9" flat round>
          <q-tooltip>{{board.settings.blocked ? 'Unlock your board' : 'Lock your board'}}</q-tooltip>
        </q-btn>
        <q-btn round dense flat icon="mdi-dots-vertical" color="grey-9">
          <q-menu anchor="bottom right" self="top right">
            <q-list dense :class="[`bg-${$theme}-1`]">
              <q-item v-close-popup clickable @click.stop="importWidgets">
                <q-item-section avatar>
                  <q-icon name="mdi-application-import"/>
                </q-item-section>
                <q-item-section>Import widgets</q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click.stop="prepareExport">
                <q-item-section avatar>
                  <q-icon name="mdi-application-export"/>
                </q-item-section>
                <q-item-section>Export widgets</q-item-section>
              </q-item>
              <q-item v-close-popup :clickable="!!canShare" @click.stop="share(uploadHandler)">
                <q-item-section avatar>
                  <q-icon name="mdi-cloud-upload-outline"/>
                </q-item-section>
                <q-item-section>Upload board</q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click.stop="$emit('get-board-info')">
                <q-item-section avatar>
                  <q-icon name="mdi-information-outline"/>
                </q-item-section>
                <q-item-section>Board info</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click.stop="modifyBoardSettings">
                <q-item-section avatar>
                  <q-icon name="mdi-cog" />
                </q-item-section>
                <q-item-section>Board settings</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </q-toolbar>
    <q-toolbar class="q-py-none bg-white" style="flex-wrap: wrap" v-if="board.settings.variables && board.settings.variables.length">
      <q-resize-observer @resize="onVariablesWrapperResize" />
      <board-variable
        v-for="(variable, varIndex) in board.settings.variables" :key="variable.name"
        :variable="variable"
        :options="getVariableValues(varIndex)"
        :value="(variablesListValues[varIndex][board.activeVariables[variable.name]] && variablesListValues[varIndex][board.activeVariables[variable.name]].value) || ''"
        @input="(value) => { changeVaribleHandler(variable.name, value) }"
      />
    </q-toolbar>
    <div class="widgets__wrapper scroll" :style="{height: wrapperHeight}" :class="{'q-px-sm': $q.platform.is.mobile, [`bg-${$theme}-1`]: true}">
      <div style="width: 100%; position: relative;" v-if="board.widgetsIndexes.length">
        <q-resize-observer @resize="onResize" />
        <grid-layout
          ref="grid"
          :layout.sync="currentLayout"
          :col-num="colNum"
          :row-height="rowHeight"
          :is-draggable="!board.settings.blocked && !isFrized && !exportEnabled"
          :is-resizable="!board.settings.blocked && !isFrized"
          :is-mirrored="false"
          :vertical-compact="false"
          :margin="[10, 10]"
          :use-css-transforms="true"
          :responsive="true"
          :prevent-collision="board.settings.preventCollision"
          @layout-ready="$refs.grid.onWindowResize()"
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
              <div
                v-if="exportEnabled"
                class="wrapper__item--export absolute-top-left absolute-bottom-right cursor-pointer"
              >
                <q-btn
                  @click="exportWidgets(widgetIndex)"
                  icon="mdi-check"
                  :color="exportedWidgetsIndexes[widgetIndex] ? 'green' : 'grey'"
                  :size="`${currentLayout[index].h > currentLayout[index].w ? currentLayout[index].w : currentLayout[index].h}rem`"
                  flat class="absolute-top-left absolute-bottom-right full-width"
                />
              </div>
              <widget-wrapper
                class="wrapper__items"
                :class="{'wrapper__items--edited': !board.settings.blocked && !isFrized}"
                :item="widgets[widgetIndex]"
                :value="values[widgetIndex]"
                :in-shortcuts="getInShortcutsAbility(widgets[widgetIndex]) && Boolean(board.shortcutsIndexes.includes(widgetIndex))"
                :blocked="board.settings.blocked || isFrized"
                @update="editWidgetSettings(widgetIndex)"
                @duplicate="duplicateWidgetHandler(widgetIndex)"
                @delete="deleteWidgetHandler(widgetIndex)"
                @fast-bind="fastBindHandler(widgetIndex)"
              >
                <component
                  :is="widgets[widgetIndex].type"
                  :item="widgets[widgetIndex]"
                  :value="values[widgetIndex]"
                  :index="widgetIndex"
                  :blocked="board.settings.blocked || isFrized"
                  @action="actionHandler"
                />
              </widget-wrapper>
            </grid-item>
        </grid-layout>
      </div>
      <div v-else class="text-center text-grey-8 q-mt-md" style="font-size: 2rem;">
        <div class="text-bold" :class="[`text-${$theme}-9`]">The board is empty</div>
        <div><q-btn :color="`${$theme}-9`" icon="mdi-plus-circle-outline" label="Add widget" @click="addWidgetHandler" /></div>
      </div>
    </div>
    <board-settings
      v-if="boardSettingsModalModel"
      v-model="boardSettingsModalModel"
      :settings="board"
      :boards="boards"
      @edit="editBoardHandler"
    />
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
  .wrapper__item--export
    background-color $grey-3
    opacity .7
    z-index 100
  .button--add
    bottom 16px
    right 16px
    z-index 1
  .dash__board
    position relative
    .widgets__wrapper
      padding-bottom 82px
      position relative
      background-image url(../../public/grid-9px-light.png)!important
</style>

<script>
import Vue from 'vue'
import BoardSettings from './BoardSettings'
import BoardVariable from './BoardVariable'
import VirtualList from 'vue-virtual-scroll-list'
import WidgetWrapper from './widgets/WidgetWrapper'
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
import MapDevices from './widgets/mapDevices/View'
import MapRoute from './widgets/mapRoute/View'
import TextSender from './widgets/textSender/View'
import Calculator from './widgets/calculator/View'
import Scheme from './widgets/scheme/View'
import { WIDGET_MODE_EDIT, WIDGET_MODE_ADD, WIDGET_MODE_DUPLICATE } from '../constants'

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
function getBreakpoint (width) {
  width = width || window.innerWidth
  const breakpoints = ['xxs', 'xs', 'sm', 'md', 'lg']
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
  props: ['board', 'boards', 'widgets', 'values', 'canShare', 'isFrized', 'hasConnection', 'variablesValues'],
  data () {
    return {
      settingsModel: false,
      boardSettingsModalModel: false,
      currentSettings: undefined,
      editedWidgetId: undefined,
      editedWidgetTopics: undefined,
      colNum: 12,
      rowHeight: 50,
      breakpoints: BREAKPOINTS,
      breakpoint: 'xxs',
      operationMode: -1,
      variablesWrapperHeight: 0,
      exportEnabled: false,
      exportedWidgetsIndexes: null
    }
  },
  computed: {
    currentLayout: {
      get () {
        return this.board.layouts[this.breakpoint]
      },
      set (layout) {
        if (this.breakpoint !== this.$refs.grid && this.$refs.grid.lastBreakpoint) { return false }
        this.$emit('update:layout', { layout, breakpoint: this.breakpoint })
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
            const { label, value } = this.getVariableModel(varValue)
            result[value] = { label, value }
            return result
          }, {})
          Object.defineProperty(variablesListValues, 'length', { enumerable: false, value: variable.values.length })
        } else if (variable.type === 1) {
          const varKeys = Object.values(this.variablesValues[variable.name] || {})
          variablesListValues = varKeys.reduce((result, varValue) => {
            const { label, value } = this.getVariableModel(varValue)
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
        this.$emit('edit:widget', { settings, widgetId: this.editedWidgetId, topics: this.editedWidgetTopics })
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
    onResize ({ width }) { this.breakpoint = getBreakpoint(width) },
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
      this.$emit('delete:widget', { widgetId: widgetIndex, settings: this.widgets[widgetIndex] })
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
    onVariablesWrapperResize ({ height }) {
      this.variablesWrapperHeight = height
    },
    changeVaribleHandler (variableName, value) {
      /* write current value */
      this.$set(this.board.activeVariables, variableName, value)
      // this.board.activeVariables[variableName] = value
      /* modify all widgets */
      this.board.widgetsIndexes.forEach(widgetIndex => {
        let widget = cloneDeep(this.widgets[widgetIndex])
        widget = this.modifyWidgetByVariables(widget)
        this.$emit('edit:widget', { settings: widget, widgetId: widget.id, topics: [...this.widgets[widgetIndex].topics] })
      })
    },
    modifyWidgetByVariables (widget) {
      const modifyTopics = (topic) => {
        if (!topic.topicTemplate) {
          topic.topicTemplate = topic.topicFilter
        }
        const variables = this.board.activeVariables
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
    naturalSort (arr, objFieldName) {
      return arr.sort((a, b) => {
        if (objFieldName) {
          a = a[objFieldName]
          b = b[objFieldName]
        }
        a = typeof a === 'string' ? a.toLowerCase() : a
        b = typeof b === 'string' ? b.toLowerCase() : b
        if (a !== b) {
          const na = Number(a),
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
      const variables = this.board.activeVariables
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
      return { label, value: val }
    },
    getVariableValues (varIndex) {
      let variableValues = this.variablesListValues[varIndex]
      const variableSettings = this.board.settings.variables[varIndex]
      variableValues = variableSettings.sortVarsBy
        ? this.naturalSort(Object.values(variableValues), 'label')
        : this.naturalSort(Object.values(variableValues), 'value')
      return variableValues
    },
    modifyBoardSettings () {
      this.boardSettingsModalModel = true
    },
    editBoardHandler (boardModel) {
      boardModel.widgetsIndexes.forEach(widgetIndex => {
        let widget = cloneDeep(this.widgets[widgetIndex])
        boardModel.settings.variables.forEach((variable) => {
          if (!variable.values.includes(boardModel.activeVariables[variable.name])) {
            boardModel.activeVariables[variable.name] = undefined
          }
        })
        widget = this.modifyWidgetByVariables(widget, boardModel)
        this.$emit('edit:widget', { settings: widget, widgetId: widget.id, topics: [...this.widgets[widgetIndex].topics] })
      })
      this.$emit('edit:board', { id: this.board.id, board: boardModel })
    },
    exportWidgets (widgetIndex) {
      if (this.exportedWidgetsIndexes[widgetIndex]) {
        this.$delete(this.exportedWidgetsIndexes, widgetIndex)
      } else {
        this.$set(this.exportedWidgetsIndexes, widgetIndex, true)
      }
    },
    prepareExport () {
      this.exportedWidgetsIndexes = {}
      this.exportEnabled = true
    },
    doneExport () {
      const widgets = Object.keys(this.exportedWidgetsIndexes).map(index => this.widgets[index])
      this.$emit('export-widgets', widgets)
      this.exportedWidgetsIndexes = null
      this.exportEnabled = false
    },
    importWidgets () {
      this.$emit('import-widgets')
    },
    share (cb) {
      if (this.canShare) {
        cb()
      } else {
        this.$emit('share-error')
      }
    },
    getInShortcutsAbility (widget) {
      return widget.type === 'informer' ||
        widget.type === 'clicker' ||
        widget.type === 'color' ||
        widget.type === 'linear' ||
        widget.type === 'radial' ||
        widget.type === 'singleselect' ||
        widget.type === 'slider' ||
        widget.type === 'status-indicator' ||
        widget.type === 'switcher' ||
        undefined
    }
  },
  components: {
    Settings,
    WidgetWrapper,
    BoardSettings,
    BoardVariable,
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
    MapDevices,
    MapRoute,
    TextSender,
    Calculator,
    Scheme,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    VirtualList
  }
}
</script>
