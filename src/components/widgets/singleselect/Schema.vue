<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      </div>
      <q-btn-toggle class='q-mt-md col-12' rounded toggle-text-color="grey-9" text-color="grey-6" flat v-model="currentSettings.mode" :options="modeOptions" />
      <div class="singleselect__items-wrapper col-12 relative-position q-mb-sm">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !currentSettings.items.length}">
            Items{{currentSettings.items.length ? '' : ' are empty'}}
            <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addItem" icon="mdi-plus"/>
          </q-item-label>
          <q-expansion-item
            v-for="(item, index) in currentSettings.items"
            :key="`${index}${item.value}`"
            group="singleselect-items"
            :header-class="[`bg-${checkUniqueValue(item.val, index) && !!item.actionTopic ? 'grey-4' : 'red-2'}`]"
            expand-icon="mdi-settings"
            :value="index === currentSettings.items.length - 1"
          >
            <template slot="header">
              <q-item-section avatar>
                <div>
                  <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                  <q-btn :disabled="index === (currentSettings.items.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                </div>
              </q-item-section>
              <q-item-section><span class="ellipsis full-width">{{item.label ? `${item.label} [${item.val}]` : item.val || 'New item'}}</span></q-item-section>
              <q-item-section side>
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <div class="row q-pa-sm">
              <div class="col-6 q-mb-sm">
                <q-input outlined dense hide-bottom-space autofocus class="q-mr-xs" color="grey-9" v-model="item.label" label="Label"/>
              </div>
              <div class="col-6  q-mb-sm">
               <typed-input class="q-ml-xs" v-model="item.val" :settings='{label: "Value", error: !checkUniqueValue(item.val, index)}'/>
              </div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input outlined dense hide-bottom-space class="q-mr-xs" color="grey-9" v-model="item.actionTopic" label="Action topic" :error="!item.actionTopic"/>
              </div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input outlined dense hide-bottom-space class="q-ml-xs" color="grey-9" v-model="item.actionPayload" label="Action payload"/>
              </div>
              <variables-helper class="col-12" v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => item.actionTopic += variable"/>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import isEqual from 'lodash/isEqual'
export default {
  name: 'SingleselectSchema',
  props: ['widget', 'board'],
  data () {
    const defaultItem = {
      label: 'item',
      val: '',
      actionTopic: 'topic/to/action',
      actionPayload: ''
    }
    const defaultSettings = {
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
        { label: 'Default mode', value: DEFAULT_MODE },
        { label: 'Command mode', value: COMMAND_MODE }
      ]
    }
  },
  methods: {
    addItem () {
      this.currentSettings.items.push(this.currentItem)
      this.currentItem = Object.assign({}, this.defaultItem)
    },
    removeItem (itemIndex) {
      this.$delete(this.currentSettings.items, itemIndex)
    },
    upItem (itemIndex) {
      const movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      const movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex + 1, 0, movedItem)
    },
    checkUniqueValue (value, index) {
      let isUnique = true
      this.currentSettings.items.map(item => item.val).some((val, valIndex) => {
        const sameValue = val === value
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
  },
  components: { VariablesHelper }
}
</script>

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 99
</style>
