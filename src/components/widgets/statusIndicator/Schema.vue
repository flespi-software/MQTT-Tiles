<template>
  <div>
    <div class="row">
      <div class="col-xs-12 q-mb-sm">
        <q-input outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.defaultIcon" label="Default icon" :error="!currentSettings.defaultIcon">
          <q-icon slot="append" :name="`mdi-${currentSettings.defaultIcon}`" size="1.5rem"/>
        </q-input>
      </div>
      <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model="currentSettings.math" label="Math expression" placeholder="%value%"/>
      <div class="text-grey-9" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
      <div class="status-indicator__items-wrapper col-12 relative-position q-mb-sm q-mt-lg">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !currentSettings.items.length}">
            Items{{currentSettings.items.length ? '' : ' are empty'}}
            <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addItem" icon="mdi-plus"/>
          </q-item-label>
          <q-expansion-item
            v-for="(item, index) in currentSettings.items"
            :key="`${index}${item.value}`"
            group="status-indicator-items"
            :header-class="[`bg-${checkUniqueItem(item, index) && !!item.actionTopic ? 'grey-4' : 'red-2'}`]"
            expand-icon="mdi-cog"
            :value="index === currentSettings.items.length - 1"
          >
            <template slot="header">
              <q-item-section side>
                <div>
                  <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                  <q-btn :disabled="index === (currentSettings.items.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                </div>
              </q-item-section>
              <q-item-section><span class="ellipsis full-width">{{getItemLabel(item, index)}}</span></q-item-section>
              <q-item-section side v-if="!item.default">
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <div class="row q-pa-sm">
              <div class="col-12 text-grey-8 q-mt-sm" style="font-size: .9rem;" v-if="item.default">
                Default item. Used if there is no data in the source or data doesn't match the specified items.
              </div>
              <div :class="[`col-${item.default ? '12' : '6'}`]" class="q-mb-sm">
                <q-input outlined dense hide-bottom-space autofocus class="q-mr-xs" color="grey-9" v-model="item.label" label="Label"/>
              </div>
              <div class="col-6" v-if="!item.default">
                <typed-input class="q-ml-xs" v-model="item.val" :settings="{label: 'Value', error: !checkUniqueItem(item, index)}"/>
              </div>
              <div class="col-12 q-mb-sm">
                <q-input outlined dense hide-bottom-space class="q-mr-xs" :style="{color: item.color}" color="grey-9" v-model="item.icon" label="Icon">
                  <q-icon slot="append" :name="`mdi-${item.icon || currentSettings.defaultIcon}`" size="1.5rem" :style="{color: item.color}"/>
                  <q-btn flat slot="after" :style="{backgroundColor: item.color}">
                    <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
                      <q-color
                        v-model="item.color"
                        format-model='hex'
                      />
                    </q-menu>
                  </q-btn>
                </q-input>
              </div>
              <div class="col-12 text-grey-6 q-mt-sm" style="font-size: .8rem;" v-if="item.default">
                You can find more icons on <a href="https://materialdesignicons.com/" target="blank">MDI</a>
              </div>
              <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model="item.math" label="Math expression" placeholder="%value%" v-if="!item.default" :error="!checkUniqueItem(item, index)"/>
              <div class="text-grey-9" v-if="!item.default" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input outlined dense hide-bottom-space class="q-mr-xs" color="grey-9" v-model="item.actionTopic" label="Action topic" :error="!item.actionTopic"/>
              </div>
              <div v-if="currentSettings.mode === 1" class="col-6">
                <q-input outlined dense hide-bottom-space class="q-ml-xs" color="grey-9" v-model="item.actionPayload" label="Action payload"/>
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model.number="currentSettings.resetTimeout" type="number" label="Reset timeout, s"/>
      <q-toggle class="q-mt-sm col-12" color="grey-9" v-model="currentSettings.isNeedShowTitles" label="Show labels with icons"/>
      <q-toggle class="q-mt-sm col-12" color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
    </div>
  </div>
</template>

<script>
import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
import isEqual from 'lodash/isEqual'
export default {
  name: 'StatusIndicatorSchema',
  props: ['widget', 'board'],
  data () {
    const defaultItem = {
      label: 'item',
      icon: '',
      color: '#9e9e9e',
      val: '',
      actionTopic: 'topic/to/action',
      actionPayload: ''
    }
    const defaultSettings = {
      items: [
        {
          label: 'default',
          icon: '',
          color: '#9e9e9e',
          math: '',
          val: '',
          default: true,
          actionTopic: 'topic/to/action',
          actionPayload: ''
        }
      ],
      save: true,
      mode: DEFAULT_MODE,
      math: '',
      defaultIcon: 'circle',
      resetTimeout: 0,
      height: 2,
      width: 1,
      maxTopicsLength: 1,
      minWidth: 1,
      minHeight: 2,
      isNeedShowTitles: false,
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
    checkUniqueItem (item, index) {
      let isUnique = true
      this.currentSettings.items.some((currentItem, itemIndex) => {
        const sameValue = currentItem.val === item.val
        const sameMath = currentItem.math === item.math
        if (sameValue && sameMath) { isUnique = itemIndex === index }
        return sameValue
      })
      return isUnique
    },
    validate () {
      return !!this.currentSettings.defaultIcon && (
        this.currentSettings.mode === DEFAULT_MODE ||
          (this.currentSettings.mode === COMMAND_MODE && this.currentSettings.items.reduce((res, item) => {
            return res && !!item.actionTopic
          }, true))
      ) &&
        !!this.currentSettings.items.length &&
        this.currentSettings.items.reduce((isUniq, item, index, items) => {
          const key = `${item.val} - ${item.math}`
          if (!isUniq[key]) { isUniq[key] = 0 }
          isUniq[key]++
          if (index === items.length - 1) {
            return Object.keys(isUniq).reduce((currentUniq, value) => {
              if (!currentUniq) { return currentUniq }
              return isUniq[value] === 1
            }, true)
          }
          return isUniq
        }, {})
    },
    getItemLabel (item, index) {
      let label = ''
      if (item.label) {
        label += `${item.label} `
        if (!item.default) {
          label += `[${item.val === undefined ? 'N/A' : item.val}]`
        }
      } else {
        label = `${item.val === undefined ? `item ${index + 1}` : item.val}`
      }
      return label
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', val)
      }
    }
  }
}
</script>

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 99
</style>
