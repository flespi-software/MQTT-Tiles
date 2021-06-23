<template>
  <div>
    <div class="row">
      <div class="col-12 relative-position q-mb-sm">
        <q-slide-transition>
          <div v-if="activeItem">
            <q-input outlined dense hide-bottom-space class="col-8 q-my-sm" color="grey-9" v-model="activeItem.label" label="Label"/>
            <component :is="`${activeItem.type}-schema`" :key="activeItemIndex + activeItem.type" :settings="activeItem" :board="board" @update="item => updateItem(item, activeItemIndex)"/>
          </div>
        </q-slide-transition>
      </div>
      <div class="col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import validateTopic from '../../../mixins/validateTopic.js'
import { getTopicModel } from '../../../constants/defaultes'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import TextSchema from './TextSchema'
import ToggleSchema from './ToggleSchema'
import StatusSchema from './StatusSchema'
import StaticTextSchema from './StaticTextSchema'
import {
  WIDGET_ITEM_TYPE_TEXT,
  WIDGET_ITEM_TYPE_TOGGLE,
  WIDGET_ITEM_TYPE_STATUS,
  WIDGET_ITEM_TYPE_STATIC_TEXT
} from './constants'
import ActiveMixin from './activeMixin'
export default {
  name: 'SchemeSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      items: [],
      topics: [],
      image: null,
      height: 6,
      width: 3,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0,
      isNeedTime: true
    }
    return {
      defaultSettings,
      constants: {
        WIDGET_ITEM_TYPE_TEXT,
        WIDGET_ITEM_TYPE_STATIC_TEXT,
        WIDGET_ITEM_TYPE_TOGGLE,
        WIDGET_ITEM_TYPE_STATUS
      },
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      defaultTopic: getTopicModel()
    }
  },
  methods: {
    getDefaultItem (type) {
      const defaultTopic = getTopicModel(),
        commonItem = {
          position: { top: 5, left: 5 },
          label: 'New Item',
          width: 20,
          height: 10
        },
        itemSettingsByType = {
          text: {
            math: '',
            valueFormat: 0,
            prefix: '',
            postfix: '',
            modificators: [],
            color: '#9e9e9e'
          },
          toggle: {
            math: '',
            trueValue: '1',
            trueIcon: '',
            trueActionTopic: '',
            truePayload: '',
            trueColor: '#9e9e9e',
            falseColor: '#333',
            falseValue: '0',
            mode: 0,
            falseIcon: '',
            falseActionTopic: '',
            falsePayload: ''
          },
          status: {
            mode: 0,
            math: '',
            defaultIcon: 'circle',
            resetTimeout: 0,
            items: [
              {
                label: 'default',
                default: true,
                icon: '',
                color: '#9e9e9e',
                math: '',
                val: ''
              }
            ]
          },
          'static-text': {
            label: '*Your label*',
            modificators: [],
            color: '#9e9e9e'
          }
        }
      const item = { ...commonItem, type, settings: itemSettingsByType[type] }
      if (type !== WIDGET_ITEM_TYPE_STATIC_TEXT) { item.topic = defaultTopic }
      return cloneDeep(item)
    },
    addTypedItem (type) {
      this.currentSettings.items.push(this.getDefaultItem(type))
      this.activeItemIndex = this.currentSettings.items.length - 1
    },
    removeItem (itemIndex) {
      this.activeItemIndex = undefined
      this.$delete(this.currentSettings.items, itemIndex)
    },
    updateImage (image) { this.currentSettings.image = image },
    updateTopics () {
      this.$set(this.currentSettings, 'topics', this.currentSettings.items.map(item => item.topic).filter(topic => !!topic))
    },
    updateItem (item, index) {
      this.$set(this.currentSettings.items, index, item)
      this.updateTopics()
    },
    validate () {
      const settings = this.currentSettings
      return !!settings.image &&
        (
          !settings.items.length ||
          !Object.keys(this.errorsByItems).length
        )
    }
  },
  mixins: [validateTopic, ActiveMixin],
  watch: {
    widget: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', val)
      }
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
    this.$widgetBus.$on('add', this.addTypedItem)
    this.$widgetBus.$on('remove', this.removeItem)
    this.$widgetBus.$on('update:image', this.updateImage)
    this.$widgetBus.$on('select', index => this.activeItemIndex = index)
  },
  destroyed () {
    this.$widgetBus.$off('add', this.addTypedItem)
    this.$widgetBus.$off('remove', this.removeItem)
    this.$widgetBus.$off('update:image', this.updateImage)
    this.$widgetBus.$off('select', index => this.activeItemIndex = index)
  },
  components: { StaticTextSchema, TextSchema, ToggleSchema, StatusSchema }
}
</script>
