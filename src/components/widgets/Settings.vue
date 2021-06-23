<template>
  <q-dialog v-model='status' @hide="closeHandler" no-esc-dismiss no-backdrop-dismiss :maximized="$q.screen.width < 1023" class="row">
    <div
      :style="{
        width: $q.screen.width < 1023 ? '100%' : '50%'
      }"
      class="bg-white"
    >
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
          Widget
        </q-toolbar-title>
      </q-toolbar>
      <div :style="{ maxHeight: $q.screen.width < 1023 ? '' : 'calc(100vh - 148px)', height: $q.screen.width < 1023 ? 'calc(100% - 100px)' : '' }" class="scroll q-pa-md">
        <q-input outlined hide-bottom-space dense color="grey-9 q-mb-sm" v-model.trim="currentSettings.name" label="Name"/>
        <q-select outlined dense hide-bottom-space color="grey-9" @input="typeChangeHandler" :value="currentSettings.type" :options="typeOptions" emit-value map-options label="Type" popup-content-class="type__content" :popup-content-style="{width: `${typeElementWidth}px`}">
          <q-resize-observer @resize="onResize" />
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" :style="{width: $q.screen.width >= 1023 ? '16.6666667%' : '25%', minHeight: '70px'}">
              <q-item-section class="text-center">
                <q-icon :size="$q.screen.width >= 1023 ? '2rem' : '1.5rem'" :name="scope.opt.rightIcon" style="width: auto;" />
                <q-item-label v-html="scope.opt.label" class="q-mt-xs ellipsis" :style="{fontSize: '.7rem'}" />
                <q-tooltip>{{scope.opt.label}}</q-tooltip>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div class="color-palette q-px-sm q-py-xs rounded-borders q-mb-lg q-mt-sm">
          <div class="text-grey-9 q-pb-xs q-ml-xs color-palette__label">Color</div>
          <div class="row color-palette__wrapper">
            <span
              v-for="color in colors"
              :key="color"
              :class="[`bg-${color}`]"
              class="q-mr-sm cursor-pointer color-palette__item"
              @click="setColor(color)"
            >
              <q-icon class="item__icon" size="1.4rem" v-if="color === currentSettings.color" name="mdi-check" color="white"/>
            </span>
          </div>
        </div>
        <q-list class="relative-position q-mb-sm" v-if="currentSettings.settings.maxTopicsLength !== 0" bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !currentSettings.dataTopics.length}">
            Topics{{currentSettings.dataTopics.length ? '' : ' are empty'}}
            <q-btn
              color="grey-9"
              class="absolute-right"
              flat label="ADD"
              @click="addTopicHandler"
              icon="mdi-plus"
              v-if="!(this.currentSettings.settings.maxTopicsLength && this.currentSettings.dataTopics.length >= this.currentSettings.settings.maxTopicsLength) || this.currentSettings.settings.maxTopicsLength === undefined"
            />
          </q-item-label>
          <q-expansion-item
            v-for="(topic, index) in currentSettings.dataTopics"
            :key="index"
            :header-class="[`bg-${topicsHighlight[index]}`]"
            group="topics"
            expand-icon="mdi-cog"
            :value="index === currentSettings.dataTopics.length - 1"
          >
            <template slot="header">
              <q-item-section><span class="ellipsis full-width">{{topic.topicTemplate || 'Empty'}}</span></q-item-section>
              <q-item-section side>
                <q-btn flat color="red-6" round dense @click="removeTopicHandler(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <topic v-model="currentSettings.dataTopics[index]" :board="board" class="q-pa-sm" :config="{ needSelectors: true, needDefault: currentSettings.type !== 'multiplier' }"/>
          </q-expansion-item>
        </q-list>
        <div v-if="$q.screen.width < 1023" class="q-mb-lg flex justify-center" style="pointer-events: none;">
          <div :class="[`bg-${currentSettings.color}-1`]" :style="previewStyles">
            <widget-wrapper
              :item="currentSettings"
              :value="{}"
              :in-shortcuts="false"
              :blocked="false"
            >
              <component
                :is="`${currentSettings.type}-view`"
                :item="currentSettings"
                :value="{}"
                :blocked="true"
              />
            </widget-wrapper>
          </div>
        </div>
        <component
          :is="currentSettings.type"
          :widget="currentSettings"
          :board="board"
          @update="updateSettingsHandler"
          @update-widget="updateWidgetHandler"
          @validate="validateSchemas"
        />
      </div>
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings || !isValideSchema" @click="saveSettingsHandler">{{saveButtonLabels[mode]}}</q-btn>
      </q-toolbar>
    </div>
    <span v-if="$q.screen.width >= 1023" style="width: 50%;" class="q-pa-md flex justify-center all-pointer-events">
      <div :class="[`bg-${currentSettings.color}-1`]" :style="previewStyles">
        <widget-wrapper
          :item="currentSettings"
          :value="{}"
          :blocked="true"
        >
          <component
            :is="`${currentSettings.type}-view`"
            :item="currentSettings"
            :value="{}"
            :blocked="true"
          />
        </widget-wrapper>
      </div>
    </span>
  </q-dialog>
</template>

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 1
  .type__content
    .q-virtual-scroll__content
      display flex
      flex-wrap wrap
  .color-palette
    border 1px solid $grey-5
    .color-palette__label
      font-size .7rem
    .color-palette__wrapper
      .color-palette__item
        position relative
        height 18px
        width 18px
        padding 3px
        border-radius 50%
        .item__icon
          position absolute
          top 0
          left 0
          height 17px
          width 17px
</style>

<script>
import merge from 'lodash/merge'
import uniq from 'lodash/uniq'
import Vue from 'vue'
import { WIDGET_STATUS_DISABLED, WIDGET_MODE_EDIT, WIDGET_MODE_ADD, WIDGET_MODE_DUPLICATE } from '../../constants'
import validateTopic from '../../mixins/validateTopic.js'
import Topic from './Topic'
import { getTopicModel } from '../../constants/defaultes'
import WidgetWrapper from './WidgetWrapper'
/* Schemas */
import Switcher from './switcher/Schema'
import Informer from './informer/Schema'
import StaticInformer from './staticInformer/Schema'
import MultiInformer from './multiInformer/Schema'
import Clicker from './clicker/Schema'
import Radial from './radial/Schema'
import Linear from './linear/Schema'
import Frame from './frame/Schema'
import Singleselect from './singleselect/Schema'
import Multiplier from './multiplier/Schema'
import Complex from './complex/Schema'
import Slider from './slider/Schema'
import Color from './color/Schema'
import MapLocation from './mapLocation/Schema'
import MapRoute from './mapRoute/Schema'
import StatusIndicator from './statusIndicator/Schema'
import TextSender from './textSender/Schema'
import Calculator from './calculator/Schema'
import Scheme from './scheme/Schema'
/* View */
import SwitcherView from './switcher/View'
import InformerView from './informer/View'
import StaticInformerView from './staticInformer/View'
import MultiInformerView from './multiInformer/View'
import ClickerView from './clicker/View'
import RadialView from './radial/View'
import LinearView from './linear/View'
import FrameView from './frame/View'
import SingleselectView from './singleselect/View'
import MultiplierView from './multiplier/Preview'
import ComplexView from './complex/Preview'
import SliderView from './slider/View'
import ColorView from './color/View'
import MapLocationView from './mapLocation/View'
import MapRouteView from './mapRoute/View'
import StatusIndicatorView from './statusIndicator/View'
import TextSenderView from './textSender/View'
import CalculatorView from './calculator/View'
import SchemeView from './scheme/Preview'

const previewStylesByType = {
  'map-route': { minWidth: '480px', minHeight: '340px' },
  'map-location': { minWidth: '480px', minHeight: '340px' },
  frame: { minWidth: '480px', minHeight: '340px', maxWidth: '480px', maxHeight: '340px' },
  radial: { minWidth: '430px', minHeight: '340px' },
  linear: { minWidth: '150px', minHeight: '420px', maxWidth: '160px', maxHeight: '420px' }
}

export default {
  name: 'Settings',
  props: ['value', 'settings', 'mode', 'board'],
  data () {
    const defaultSettings = {
      name: 'New widget',
      color: 'grey',
      type: 'informer',
      topics: [],
      dataTopics: [], // topics for datasource
      settings: {},
      status: WIDGET_STATUS_DISABLED
    }
    return {
      defaultSettings,
      currentSettings: this.settings ? merge({}, defaultSettings, this.settings) : merge({}, defaultSettings),
      typeOptions: [
        { label: 'Text', value: 'informer', rightIcon: 'mdi-format-text-variant' },
        { label: 'Multi text', value: 'multi-informer', rightIcon: 'mdi-card-text-outline' },
        { label: 'Static text', value: 'static-informer', rightIcon: 'mdi-format-text' },
        { label: 'Toggle', value: 'switcher', rightIcon: 'mdi-toggle-switch-outline' },
        { label: 'Button', value: 'clicker', rightIcon: 'mdi-send' },
        { label: 'Textarea', value: 'text-sender', rightIcon: 'mdi-text-subject' },
        { label: 'Slider', value: 'slider', rightIcon: 'mdi-ray-vertex' },
        { label: 'Color', value: 'color', rightIcon: 'mdi-palette' },
        { label: 'Map (Location)', value: 'map-location', rightIcon: 'mdi-map-marker-outline' },
        { label: 'Map (Route)', value: 'map-route', rightIcon: 'mdi-map-marker-distance' },
        { label: 'Status Indicator', value: 'status-indicator', rightIcon: 'mdi-lightbulb-outline' },
        { label: 'Formula', value: 'calculator', rightIcon: 'mdi-calculator' },
        { label: 'Radial gauge', value: 'radial', rightIcon: 'mdi-gauge' },
        { label: 'Linear gauge', value: 'linear', rightIcon: 'mdi-oil-temperature' },
        { label: 'Iframe', value: 'frame', rightIcon: 'mdi-window-maximize' },
        { label: 'Radio button', value: 'singleselect', rightIcon: 'mdi-radiobox-marked' },
        { label: 'Multiplier', value: 'multiplier', rightIcon: 'mdi-monitor-multiple' },
        { label: 'Complex', value: 'complex', rightIcon: 'mdi-ballot-outline' },
        { label: 'Scheme', value: 'scheme', rightIcon: 'mdi-floor-plan' }
      ],
      typeElementWidth: 0,
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue', 'purple', 'deep-orange', 'cyan', 'brown', 'blue-grey'],
      isValideSchema: true,
      defaultTopic: getTopicModel(),
      saveButtonLabels: {
        [WIDGET_MODE_ADD]: 'Save',
        [WIDGET_MODE_EDIT]: 'Update',
        [WIDGET_MODE_DUPLICATE]: 'Clone'
      }
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.isValidCurrentTopics &&
        this.currentSettings.topics.every(topicFilter => this.validateTopic(topicFilter))
    },
    status: {
      get () { return this.value },
      set (value) { this.$emit('input', value) }
    },
    isValidCurrentTopics () {
      return (!!this.currentSettings.dataTopics.length || this.currentSettings.settings.maxTopicsLength === 0) &&
        this.currentSettings.dataTopics.every(topic => this.validateTopic(topic.topicFilter)) &&
        /* check topics don`t duplicating */
        this.currentSettings.dataTopics.every(topic => this.currentSettings.dataTopics.filter(topicCompare => topicCompare.topicFilter === topic.topicFilter).length === 1) &&
        (this.currentSettings.settings.maxTopicsLength === undefined || (this.currentSettings.settings.maxTopicsLength !== undefined && this.currentSettings.settings.maxTopicsLength === this.currentSettings.dataTopics.length))
    },
    topicsHighlight () {
      return this.currentSettings.dataTopics.reduce((colors, topic, index) => {
        if (this.validateTopic(topic.topicFilter) && this.checkUniqueTopic(topic.topicFilter, index)) {
          colors[index] = 'grey-4'
        } else {
          colors[index] = 'red-2'
        }
        return colors
      }, [])
    },
    previewStyles () {
      const typeStyles = previewStylesByType[this.currentSettings.type] || {}
      const defaultStyles = {
        minWidth: '280px',
        minHeight: '110px',
        maxWidth: '560px',
        borderRadius: '4px',
        border: '1px solid transparent',
        boxShadow: '0 1px 5px rgba(0,0,0,0.2),0 2px 2px rgba(0,0,0,0.14),0 3px 1px -2px rgba(0,0,0,0.12)!important'
      }
      return { ...defaultStyles, ...typeStyles }
    }
  },
  methods: {
    saveSettingsHandler () {
      this.$emit('save', this.currentSettings)
      this.closeHandler()
    },
    closeHandler () {
      this.$emit('input', false)
      this.$emit('hide')
      this.$nextTick(() => {
        this.currentSettings = merge({}, this.defaultSettings)
      })
    },
    typeChangeHandler (type) {
      if (this.currentSettings.type !== type) {
        this.currentSettings.settings = {}
        this.currentSettings.dataTopics = []
      }
      this.$set(this.currentSettings, 'type', type)
    },
    setColor (color) {
      Vue.set(this.currentSettings, 'color', color)
    },
    validateSchemas (status) {
      this.isValideSchema = status
    },
    addTopicHandler () {
      this.currentSettings.dataTopics.push(Object.assign({}, this.defaultTopic))
    },
    removeTopicHandler (index) {
      Vue.delete(this.currentSettings.dataTopics, index)
    },
    checkUniqueTopic (topic, index) {
      let isUnique = true
      this.currentSettings.dataTopics.map(topic => topic.topicFilter).some((currentTopic, currentTopicIndex) => {
        const sameValue = currentTopic === topic
        if (sameValue) { isUnique = currentTopicIndex === index }
        return sameValue
      })
      return isUnique
    },
    updateWidgetHandler (patch) {
      this.currentSettings = merge(this.currentSettings, patch)
    },
    updateSettingsHandler (settings) {
      this.$set(this.currentSettings, 'settings', settings)
    },
    generateTopics () {
      let topics = this.currentSettings.dataTopics.map(topic => topic.topicFilter)
      /* topics for uniq widget logic */
      if (this.currentSettings.settings.topics) {
        topics = uniq([...topics, ...this.currentSettings.settings.topics.map(topic => topic.topicFilter)])
      }
      return topics
    },
    onResize ({ width }) {
      this.typeElementWidth = width
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    },
    'currentSettings.dataTopics' () {
      this.currentSettings.topics = this.generateTopics()
    },
    'currentSettings.settings.topics': {
      deep: true,
      handler () {
        this.currentSettings.topics = this.generateTopics()
      }
    }
  },
  created () {
    Vue.prototype.$widgetBus = new Vue()
  },
  destroyed () {
    Vue.prototype.$widgetBus = undefined
  },
  mixins: [validateTopic],
  components: {
    Topic,
    WidgetWrapper,
    Switcher,
    Informer,
    Clicker,
    Radial,
    Linear,
    Frame,
    Singleselect,
    Multiplier,
    Complex,
    StaticInformer,
    Scheme,
    MultiInformer,
    Slider,
    Color,
    MapLocation,
    MapRoute,
    StatusIndicator,
    TextSender,
    Calculator,
    SwitcherView,
    InformerView,
    ClickerView,
    RadialView,
    LinearView,
    FrameView,
    SingleselectView,
    MultiplierView,
    ComplexView,
    StaticInformerView,
    SchemeView,
    MultiInformerView,
    SliderView,
    ColorView,
    MapLocationView,
    MapRouteView,
    StatusIndicatorView,
    TextSenderView,
    CalculatorView
  }
}
</script>
