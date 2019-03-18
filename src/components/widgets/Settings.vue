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
        <q-list class="relative-position" v-if="this.currentSettings.settings.maxTopicsLength !== 0">
          <q-btn
            color="dark"
            style="top: -20px; right: 8px; position: absolute; z-index: 1130;"
            class="col-12"
            fab-mini
            @click="addTopicHandler"
            icon="mdi-plus"
            v-if="!(this.currentSettings.settings.maxTopicsLength && this.currentSettings.dataTopics.length >= this.currentSettings.settings.maxTopicsLength) || this.currentSettings.settings.maxTopicsLength === undefined"
          />
          <q-list-header :class="{'text-red-6': !currentSettings.dataTopics.length}">Topics{{currentSettings.dataTopics.length ? '' : ' is empty'}}</q-list-header>
          <q-collapsible
            v-for="(topic, index) in currentSettings.dataTopics"
            :key="`${index}${topic.topicFilter}`"
            :header-class="[`bg-${validateTopic(topic.topicFilter) && checkUniqueTopic(topic.topicFilter, index) ? 'grey-4' : 'red-2'}`]"
            collapse-icon="mdi-settings"
            :opened="true"
          >
            <template slot="header">
              <q-item-main :label="topic.topicFilter || 'Empty'" />
              <q-item-side right>
                <q-btn flat color="red-6" rounded @click="removeTopicHandler(index)" icon="mdi-delete"/>
              </q-item-side>
            </template>
            <topic v-model="currentSettings.dataTopics[index]" />
          </q-collapsible>
        </q-list>
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
import uniq from 'lodash/uniq'
import Vue from 'vue'
import { WIDGET_STATUS_DISABLED } from '../../constants'
import validateTopic from '../../mixins/validateTopic.js'
import Topic from './components/Topic'
import Switcher from './swither/Schema'
import Informer from './informer/Schema'
import Clicker from './clicker/Schema'
import Radial from './radial/Schema'
import Linear from './linear/Schema'
import Frame from './frame/Schema'
import Singleselect from './singleselect/Schema'

export default {
  name: 'Settings',
  props: ['value', 'settings'],
  data () {
    let defaultSettings = {
      name: 'New widget',
      color: 'grey',
      type: 'switcher',
      topics: [],
      dataTopics: [], // topics for datasource
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
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      }
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.currentSettings.name &&
        !!this.isValidCurrentTopics &&
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
      this.currentSettings.dataTopics.push(Object.assign({}, this.defaultTopic))
    },
    removeTopicHandler (index) {
      Vue.delete(this.currentSettings.dataTopics, index)
    },
    checkUniqueTopic (topic, index) {
      let isUnique = true
      this.currentSettings.dataTopics.map(topic => topic.topicFilter).some((currentTopic, currentTopicIndex) => {
        let sameValue = currentTopic === topic
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
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    },
    'currentSettings.dataTopics' () {
      this.currentSettings.topics = this.generateTopics()
    },
    'currentSettings.settings.topics' () {
      this.currentSettings.topics = this.generateTopics()
    }
  },
  mixins: [validateTopic],
  components: {
    Topic, Switcher, Informer, Clicker, Radial, Linear, Frame, Singleselect
  }
}
</script>
