<template>
  <div>
    <div class="row">
      <div class="scheme__items-wrapper col-12 relative-position q-mb-sm">
        <div v-if="currentSettings.image">
          <div class="scheme__add-pannel" :class="[`bg-${widget.color}-2`]">
            <q-btn
              v-for="item in itemTypes" :key="item.value"
              flat dense :icon="item.icon" color="grey-7"
              @click="addTypedItem(item.value)"
            >
              <q-tooltip>Add {{item.label}}</q-tooltip>
            </q-btn>
            <q-btn class="float-right" dense flat icon="mdi-close" color="red" @click="currentSettings.image = null">
              <q-tooltip>Remove image</q-tooltip>
            </q-btn>
          </div>
          <div draggable="false" ref="imageWrapper" class="scheme__image-wrapper q-pa-xs relative-position" :class="[`bg-${widget.color}-1`]">
            <img :src='currentSettings.image' width="100%" draggable="false" @click="activeItemIndex = undefined"/>
            <div
              v-for="(item, index) in currentSettings.items" :key="index"
              ref="dragItems"
              v-touch-pan.prevent.mouse="e => { if (activeItemIndex === index) { onMove(e, index) } }"
              @click="activeItemIndex = index"
              class="scheme__item-view-wrapper absolute cursor-pointer"
              :class="{
                'scheme__item-view-wrapper--active': activeItemIndex === index,
                'scheme__item-view-wrapper--error': errorsByItems[index]
              }"
              :style="{
                left: `${item.position.left}%`,
                top: `${item.position.top}%`,
                width: `${item.width}%`,
                height: `${item.height}%`
              }"
            >
              <component :is="`${item.type}-view`" :item="item"/>
              <template v-if="activeItemIndex === index">
                <div v-touch-pan.prevent.mouse="e => onResize(e, index)" class="item-view-wrapper__size-handler"></div>
                <q-btn
                  color="red" icon="mdi-close" dense round unelevated size="5px"
                  @click="removeItem(index)" class="absolute-top-right" style="top: -4px; right: -4px;"
                >
                  <q-tooltip>Remove widget</q-tooltip>
                </q-btn>
              </template>
            </div>
          </div>
        </div>
        <q-file v-else class="scheme__image-picker q-mb-md" borderless
          v-model="image" @input="getBase64"
          accept="image/*"
          max-file-size="1048576"
        >
          <div class="absolute-full text-center">
            <q-icon name="mdi-image" :color="widget.color" size="4rem" style="margin-top: 40px"/>
            <div class="text-h5 text-grey-9">Upload image</div>
            <div class="text-grey-9" style="font-size: .8rem">Max size: 2MB</div>
          </div>
        </q-file>
        <q-slide-transition>
          <div v-if="activeItem">
            <q-input outlined dense hide-bottom-space class="col-8 q-my-sm" color="grey-9" v-model="activeItem.label" label="Label"/>
            <component :is="`${activeItem.type}-schema`" :settings="activeItem" :board="board" @update="item => updateItem(item, activeItemIndex)"/>
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
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import TextSchema from './TextSchema'
import TextView from './TextView'
import ToggleSchema from './ToggleSchema'
import ToggleView from './ToggleView'
import StatusSchema from './StatusSchema'
import StatusView from './StatusView'
import StaticTextSchema from './StaticTextSchema'
import StaticTextView from './StaticTextView'
const WIDGET_ITEM_TYPE_TEXT = 'text',
  WIDGET_ITEM_TYPE_TOGGLE = 'toggle',
  WIDGET_ITEM_TYPE_STATUS = 'status',
  WIDGET_ITEM_TYPE_STATIC_TEXT = 'static-text'
const componentsByType = {
  text: TextSchema,
  toggle: ToggleSchema,
  status: StatusSchema,
  'static-text': StaticTextSchema
}
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
      image: null,
      defaultSettings,
      constants: {
        WIDGET_ITEM_TYPE_TEXT,
        WIDGET_ITEM_TYPE_STATIC_TEXT,
        WIDGET_ITEM_TYPE_TOGGLE,
        WIDGET_ITEM_TYPE_STATUS
      },
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      itemTypes: [
        { label: 'text', value: WIDGET_ITEM_TYPE_TEXT, icon: 'mdi-format-text-variant' },
        { label: 'label', value: WIDGET_ITEM_TYPE_STATIC_TEXT, icon: 'mdi-format-text' },
        { label: 'toggle', value: WIDGET_ITEM_TYPE_TOGGLE, icon: 'mdi-toggle-switch-outline' },
        { label: 'status', value: WIDGET_ITEM_TYPE_STATUS, icon: 'mdi-lightbulb-outline' }
      ],
      defaultTopic: {
        topicTemplate: '',
        topicFilter: '',
        payloadType: 0,
        payloadField: '',
        payloadNameField: ''
      },
      activeItemIndex: undefined
    }
  },
  computed: {
    activeItem () {
      let item
      if (typeof this.activeItemIndex !== 'undefined') {
        item = this.currentSettings.items[this.activeItemIndex]
      }
      return item
    },
    errorsByItems () {
      return this.currentSettings.items.reduce((errors, item, index, items) => {
        const hasTopic = item.topic === undefined || (!!item.topic && this.validateTopic(item.topic.topicFilter))
        const validator = get(componentsByType[item.type], 'methods.validate', () => true)
        const isValid = hasTopic && validator(item)
        if (!isValid) { errors[index] = true }
        return errors
      }, {})
    }
  },
  methods: {
    getDefaultItem (type) {
      const defaultTopic = {
          topicTemplate: '',
          topicFilter: '',
          payloadType: 0,
          payloadField: '',
          payloadNameField: ''
        },
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
    },
    getBase64 (file) {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.currentSettings.image = reader.result
      }
    },
    onMove (e, index) {
      const { position, height: itemHeight, width: itemWidth } = this.currentSettings.items[index],
        parent = this.$refs.imageWrapper.getBoundingClientRect(),
        el = this.$refs.dragItems[index].getBoundingClientRect(),
        width = parent.width,
        height = parent.height,
        deltaHeight = (e.delta.y / height) * 100,
        deltaWidth = (e.delta.x / width) * 100,
        resultPosition = { top: position.top + deltaHeight, left: position.left + deltaWidth }
      if (el.top < parent.top) {
        resultPosition.top = 0
      } else if (el.bottom > parent.bottom) {
        resultPosition.top = 100 - itemHeight
      }
      if (el.left < parent.left) {
        resultPosition.left = 0
      } else if (el.right > parent.right) {
        resultPosition.left = 100 - itemWidth
      }
      this.$set(this.currentSettings.items[index], 'position', resultPosition)
    },
    onResize (e, index) {
      const parent = this.$refs.imageWrapper.getBoundingClientRect(),
        width = parent.width,
        height = parent.height,
        item = this.currentSettings.items[index]
      let deltaHeight = (e.delta.y / height) * 100,
        deltaWidth = (e.delta.x / width) * 100
      if (e.position.top > parent.bottom) {
        deltaHeight = 0
      }
      if (e.position.left > parent.right) {
        deltaWidth = 0
      }
      const setWidth = item.width + deltaWidth,
        setHeight = item.height + deltaHeight
      this.$set(this.currentSettings.items[index], 'width', setWidth)
      this.$set(this.currentSettings.items[index], 'height', setHeight)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  mixins: [validateTopic],
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
  components: { StaticTextSchema, TextSchema, ToggleSchema, StatusSchema, TextView, ToggleView, StatusView, StaticTextView }
}
</script>

<style lang="stylus">
  .scheme__image-wrapper
    position relative
    border solid $grey-6 1px
    border-radius 5px
    border-top-right-radius 0
    border-top-left-radius 0
    overflow hidden
  .scheme__image-picker
    border dashed $grey-9 1px
    border-radius 5px
    .q-field__native
      min-height 200px
      z-index 1
      input
        color transparent
        text-shadow 0 0 0 #000
        outline none!important
        border none
        &:focus, &:hover, &:active
          outline none!important
  .scheme__item-view-wrapper
    &--active
      box-shadow 0 1px 5px rgba(0,0,0,20%), 0 2px 2px rgba(0,0,0,14%), 0 3px 1px -2px rgba(0,0,0,12%) !important
      background-color rgba(255, 255, 255, .3)
      z-index 1
    &--error
      border: 2px solid $red-4
    border: 2px solid transparent
    border-radius 3px
    .item-view-wrapper__size-handler
      cursor nwse-resize
      background transparent
      border 2px $yellow-10 solid
      border-top none
      border-left none
      height 6px
      width 6px
      position absolute
      bottom 0px
      right 0px
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 99
  .scheme__add-pannel
    border-radius 3px
    border 1px solid $grey-6
    position relative
    padding 3px
    border-bottom none
    border-bottom-left-radius 0
    border-bottom-right-radius 0
</style>
