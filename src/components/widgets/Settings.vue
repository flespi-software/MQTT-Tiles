<template>
  <q-modal v-model='status' @hide="closeHandler">
    <q-modal-layout>
      <q-toolbar slot="header" color='dark'>
        <q-toolbar-title>
          Widget
        </q-toolbar-title>
      </q-toolbar>
      <div style="margin: 20px;" :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh', width: $q.platform.is.mobile ? 'calc(100% - 40px)' : '50vw'}">
        <q-input color="dark"  v-model="currentSettings.name" float-label="Name" :error="!currentSettings.name"/>
        <q-select color="dark" v-model="currentSettings.type" :options="typeOptions" float-label="Type" @input="changeTypeHandler"/>
        <div class="color-palette">
          <div class="text-grey-6 q-pb-sm color-palette__label">Color</div>
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
        <q-field
          :error="!isValidCurrentTopics"
          error-label="You must add all topics, which used by widget"
        >
          <q-chips-input
            v-if="!(this.currentSettings.settings.maxTopicsLength && this.currentSettings.topics.length >= this.currentSettings.settings.maxTopicsLength) || this.currentSettings.settings.maxTopicsLength === undefined"
            v-model="currentSettings.topics"
            color="dark"
            float-label="Topics"
            add-icon="mdi-plus"
            :error="!isValidCurrentTopics"
          />
          <div class="q-my-sm" style="font-size: .8rem;" v-else>
            <span class="q-mr-xs q-mt-xs" :class="{'text-red-6':  !currentSettings.topics.length}" style="display: inline-flex; font-size: .9rem; line-height: 26px; vertical-align: bottom;">Topics: </span>
            <q-chip class="q-mr-xs q-mt-xs" small v-for="(topic, index) in currentSettings.topics" :key="topic" closable @hide="removeTopicHandler(index)">{{topic}}</q-chip>
          </div>
        </q-field>
        <component
          :is="currentSettings.type"
          :widget="currentSettings"
          @update="updateSettingsHandler"
          @validate="validateSchemas"
        />
      </div>
      <q-toolbar slot="footer" color='dark'>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings || !isValideSchema" @click="saveSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<style lang="stylus">
  .color-palette
    padding: 8px 0;
    .color-palette__label
      font-size .75rem
    .color-palette__wrapper
      .color-palette__item
        position relative
        height 20px
        width 20px
        padding 3px
        border-radius 50%
        .item__icon
          position absolute
          top 0
          left 0
          height 20px
          width 20px
</style>

<script>
import merge from 'lodash/merge'
import Vue from 'vue'
import { WIDGET_STATUS_DISABLED } from '../../constants'
import validateTopic from '../../mixins/validateTopic.js'
import Switcher from './swither/Schema'
import Informer from './informer/Schema'
import Clicker from './clicker/Schema'
import Radial from './radial/Schema'
import Linear from './linear/Schema'
import Frame from './frame/Schema'
import Singleselect from './singleselect/Schema'

const DEFAULT_TOPIC = 'path/to/data'

export default {
  name: 'Settings',
  props: ['value', 'settings'],
  data () {
    let defaultSettings = {
      name: 'New widget',
      color: 'grey',
      type: 'switcher',
      topics: [],
      settings: {},
      status: WIDGET_STATUS_DISABLED
    }
    return {
      defaultSettings,
      currentSettings: this.settings ? merge({}, defaultSettings, this.settings) : merge({}, defaultSettings),
      typeOptions: [
        {label: 'Toggle', value: 'switcher'},
        {label: 'Text', value: 'informer'},
        {label: 'Button', value: 'clicker'},
        {label: 'Radial guage', value: 'radial'},
        {label: 'Linear guage', value: 'linear'},
        {label: 'Iframe', value: 'frame'},
        {label: 'Singleselect', value: 'singleselect'}
      ],
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue'],
      isValideSchema: true,
      currentTopic: DEFAULT_TOPIC
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.currentSettings.name &&
        !!this.isValidCurrentTopics
    },
    status: {
      get () { return this.value },
      set (value) { this.$emit('input', value) }
    },
    isValidCurrentTopics () {
      return !!this.currentSettings.topics.length &&
        this.currentSettings.topics.every(topic => this.validateTopic(topic)) &&
        /* check topics don`t duplicating */
        this.currentSettings.topics.every(topic => this.currentSettings.topics.filter(topicCompare => topicCompare === topic).length === 1) &&
        (!this.currentSettings.settings.maxTopicsLength || (this.currentSettings.settings.maxTopicsLength && this.currentSettings.settings.maxTopicsLength === this.currentSettings.topics.length))
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
    setColor (color) {
      Vue.set(this.currentSettings, 'color', color)
    },
    changeTypeHandler () {
      Vue.set(this.currentSettings, 'settings', {})
    },
    validateSchemas (status) {
      this.isValideSchema = status
    },
    addTopicHandler () {
      this.currentSettings.topics.push(this.currentTopic)
      this.currentTopic = DEFAULT_TOPIC
    },
    removeTopicHandler (index) {
      Vue.delete(this.currentSettings.topics, index)
    },
    updateSettingsHandler (settings) {
      Vue.set(this.currentSettings, 'settings', settings)
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    }
  },
  mixins: [validateTopic],
  components: {
    Switcher, Informer, Clicker, Radial, Linear, Frame, Singleselect
  }
}
</script>
