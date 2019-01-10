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
        <q-select color="dark" v-model="currentSettings.type" :options="typeOptions" float-label="Type"/>
        <q-input color="dark"  v-model="currentSettings.topic" float-label="Topic" :error="!currentSettings.topic || !validateTopic(currentSettings.topic)"/>
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
        <component
          :is="currentSettings.type"
          :settings="currentSettings.settings"
          @update="(settings) => { currentSettings.settings = settings }"
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

export default {
  name: 'Settings',
  props: ['value', 'settings'],
  data () {
    let defaultSettings = {
      name: 'New widget',
      color: 'grey',
      value: null,
      type: 'switcher',
      topic: 'path/to/data',
      settings: {},
      status: WIDGET_STATUS_DISABLED
    }
    return {
      defaultSettings,
      currentSettings: this.settings ? merge({}, defaultSettings, this.settings) : merge({}, defaultSettings),
      typeOptions: [
        {label: 'Toggle', value: 'switcher'},
        {label: 'Text', value: 'informer'},
        {label: 'Button', value: 'clicker'}
      ],
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue'],
      isValideSchema: true
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.currentSettings.name &&
        !!this.currentSettings.topic && this.validateTopic(this.currentSettings.topic)
    },
    status: {
      get () { return this.value },
      set (value) { this.$emit('input', value) }
    }
  },
  methods: {
    saveSettingsHandler () {
      this.$emit('save', this.currentSettings)
      this.closeHandler()
      this.$nextTick(() => {
        this.currentSettings = merge({}, this.defaultSettings)
      })
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
    validateSchemas (status) {
      this.isValideSchema = status
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    }
  },
  mixins: [validateTopic],
  components: {
    Switcher, Informer, Clicker
  }
}
</script>
