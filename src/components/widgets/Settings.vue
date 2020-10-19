<template>
  <q-dialog v-model='status' @hide="closeHandler" no-esc-dismiss no-backdrop-dismiss :maximized="$q.platform.is.mobile">
    <div :style="{ width: $q.platform.is.mobile ? '100%' : '80vw' }" class="bg-white">
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
          Widget
        </q-toolbar-title>
      </q-toolbar>
      <div :style="{ maxHeight: $q.platform.is.mobile ? '' : 'calc(100vh - 148px)', height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '' }" class="scroll q-pa-md">
        <q-input outlined hide-bottom-space dense color="grey-9 q-mb-sm" v-model.trim="currentSettings.name" label="Name"/>
        <q-select outlined dense hide-bottom-space color="grey-9" @input="typeChangeHandler" :value="currentSettings.type" :options="typeOptions" emit-value map-options label="Type" popup-content-class="type__content" :popup-content-style="{width: `${typeElementWidth}px`}">
          <q-resize-observer @resize="onResize" />
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" :style="{width: $q.platform.is.desktop ? '16.6666667%' : '25%', minHeight: '70px'}">
              <q-item-section class="text-center">
                <q-icon :size="$q.platform.is.desktop ? '2rem' : '1.5rem'" :name="scope.opt.rightIcon" style="width: auto;" />
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
            expand-icon="mdi-settings"
            :value="index === currentSettings.dataTopics.length - 1"
          >
            <template slot="header">
              <q-item-section><span class="ellipsis full-width">{{topic.topicTemplate || 'Empty'}}</span></q-item-section>
              <q-item-section side>
                <q-btn flat color="red-6" round dense @click="removeTopicHandler(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <topic v-model="currentSettings.dataTopics[index]" :board="board" class="q-pa-sm" :config="{ needSelectors: true }"/>
          </q-expansion-item>
        </q-list>
        <component
          :is="currentSettings.type"
          :widget="currentSettings"
          :board="board"
          @update="updateSettingsHandler"
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
        { label: 'Text', value: 'informer', rightIcon: 'mdi-format-color-text' },
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
        { label: 'Complex', value: 'complex', rightIcon: 'mdi-ballot-outline' }
      ],
      typeElementWidth: 0,
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue', 'purple', 'deep-orange', 'cyan', 'brown', 'blue-grey'],
      isValideSchema: true,
      defaultTopic: {
        topicTemplate: '',
        topicFilter: '',
        payloadType: 0,
        payloadField: '',
        payloadNameField: ''
      },
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
    updateSettingsHandler (settings) {
      Vue.set(this.currentSettings, 'settings', settings)
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
  mixins: [validateTopic],
  components: {
    Topic, Switcher, Informer, Clicker, Radial, Linear, Frame, Singleselect, Multiplier, Complex, StaticInformer, MultiInformer, Slider, Color, MapLocation, MapRoute, StatusIndicator, TextSender, Calculator
  }
}
</script>
