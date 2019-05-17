<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      </div>
      <q-btn-toggle class='q-mt-md col-12' rounded toggle-text-color="dark" text-color="grey-6" flat v-model="currentSettings.mode" :options="modeOptions" />
      <div class="singleselect__items-wrapper col-12 relative-position q-mb-sm">
        <q-list>
          <q-btn color="dark" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addItem" icon="mdi-plus"/>
          <q-list-header :class="{'text-red-6': !currentSettings.items.length}">Items{{currentSettings.items.length ? '' : ' are empty'}}</q-list-header>
          <q-collapsible
            v-for="(item, index) in currentSettings.items"
            :key="`${index}${item.value}`"
            group="singleselect-items"
            :header-class="[`bg-${checkUniqueValue(item.val, index) && !!item.actionTopic ? 'grey-4' : 'red-2'}`]"
            collapse-icon="mdi-settings"
            :opened="true"
          >
            <template slot="header">
              <q-item-side right>
                <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                <q-btn :disabled="index === (currentSettings.items.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
              </q-item-side>
              <q-item-main :label="item.label ? `${item.label} [${item.val}]` : item.val || `item ${index + 1}`" />
              <q-item-side right>
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-side>
            </template>
            <div class="row">
              <div class="col-6">
                <q-input autofocus class="q-mr-xs" color="dark" v-model="item.label" float-label="Label"/>
              </div>
              <div class="col-6">
                <q-input class="q-ml-xs" color="dark" v-model="item.val" float-label="Value" :error="!checkUniqueValue(item.val, index)"/>
              </div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input class="q-mr-xs" color="dark" v-model="item.actionTopic" float-label="Action topic" :error="!item.actionTopic"/>
              </div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input class="q-ml-xs" color="dark" v-model="item.actionPayload" float-label="Action payload"/>
              </div>
            </div>
          </q-collapsible>
        </q-list>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
export default {
  name: 'SingleselectSchema',
  props: ['widget'],
  data () {
    let defaultItem = {
      label: 'item',
      val: '',
      actionTopic: 'topic/to/action',
      actionPayload: ''
    }
    let defaultSettings = {
      items: [],
      save: true,
      mode: DEFAULT_MODE,
      height: 4,
      width: 2,
      maxTopicsLength: 1,
      minWidth: 2,
      minHeight: 4,
      isNeedTime: true
    }
    return {
      defaultSettings,
      defaultItem,
      currentItem: Object.assign({}, defaultItem),
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      modeOptions: [
        {label: 'Default mode', value: DEFAULT_MODE},
        {label: 'Command mode', value: COMMAND_MODE}
      ]
    }
  },
  methods: {
    addItem () {
      this.currentSettings.items.push(this.currentItem)
      this.currentItem = Object.assign({}, this.defaultItem)
    },
    removeItem (itemIndex) {
      Vue.delete(this.currentSettings.items, itemIndex)
    },
    upItem (itemIndex) {
      let movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      let movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex + 1, 0, movedItem)
    },
    checkUniqueValue (value, index) {
      let isUnique = true
      this.currentSettings.items.map(item => item.val).some((val, valIndex) => {
        let sameValue = val === value
        if (sameValue) { isUnique = valIndex === index }
        return sameValue
      })
      return isUnique
    },
    validate () {
      return (
        this.currentSettings.mode === DEFAULT_MODE ||
          (this.currentSettings.mode === COMMAND_MODE && this.currentSettings.items.reduce((res, item) => {
            return res && !!item.actionTopic
          }, true))
      ) &&
        !!this.currentSettings.items.length &&
        this.currentSettings.items.reduce((isUniq, item, index, items) => {
          if (!isUniq[item.val]) { isUniq[item.val] = 0 }
          isUniq[item.val]++
          if (index === items.length - 1) {
            return Object.keys(isUniq).reduce((currentUniq, value) => {
              if (!currentUniq) { return currentUniq }
              return isUniq[value] === 1
            }, true)
          }
          return isUniq
        }, {})
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val, old) {
        if (isEqual(val, old)) { return false }
        this.$emit('validate', this.validate())
        this.$emit('update', val)
      }
    }
  }
}
</script>
