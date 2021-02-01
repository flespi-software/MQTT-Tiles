<template>
  <div class="q-mt-xl">
    <div class="row">
      <q-card class="complex__items-editor row col-12 q-mb-xl" :class="[`bg-${widget.color}-1`]">
        <div class="items__top col-12 flex q-px-md q-py-xs" style="background-color: rgba(255,255,255,0.5)">
          <component
            v-for="(item, layoutIndex) in currentSettings.items.filter(item => item.position === 'top')"
            :key="`top${layoutIndex}${item.index}`"
            class="complex__element cursor-pointer"
            :is="`my-${currentSettings.items[item.index].type}`"
            @click.native="selectHandler('top', layoutIndex)"
            :item="currentSettings.items[item.index]"
            :color="widget.color"
            :selected="(!!edited && edited.position === 'top' && edited.indexByPosition === layoutIndex)"
          />
          <add-menu class="q-ml-sm" anchor="bottom left" self="top left" @add="(type) => addItem(type, 'top')"/>
        </div>
        <div class="items__left col-6 flex q-pa-sm">
          <component
            v-for="(item, layoutIndex) in currentSettings.items.filter(item => item.position === 'left')"
            :key="`left${layoutIndex}${item.index}`"
            class="complex__element cursor-pointer"
            :is="`my-${currentSettings.items[item.index].type}`"
            @click.native="selectHandler('left', layoutIndex)"
            :item="currentSettings.items[item.index]"
            :color="widget.color"
            :selected="(!!edited && edited.position === 'left' && edited.indexByPosition === layoutIndex)"
          />
          <add-menu style="width: 100%; min-height: 30px;" anchor="top middle" self="bottom middle" @add="(type) => addItem(type, 'left')"/>
        </div>
        <div class="items__right col-6 q-pa-sm">
          <component
            v-for="(item, layoutIndex) in currentSettings.items.filter(item => item.position === 'right')"
            :key="`right${layoutIndex}${item.index}`"
            class="complex__element text-center cursor-pointer"
            :is="`my-${currentSettings.items[item.index].type}`"
            @click.native="selectHandler('right', layoutIndex)"
            :item="currentSettings.items[item.index]"
            :color="widget.color"
            :selected="(!!edited && edited.position === 'right' && edited.indexByPosition === layoutIndex)"
          />
          <add-menu style="width: 100%; min-height: 30px;" anchor="top middle" self="bottom middle" @add="(type) => addItem(type, 'right')" />
        </div>
        <div class="items__bottom col-12 flex q-px-md q-py-xs" style="background-color: rgba(255,255,255,0.5)">
          <component
            v-for="(item, layoutIndex) in currentSettings.items.filter(item => item.position === 'bottom')"
            :key="`bottom${layoutIndex}${item.index}`"
            class="complex__element cursor-pointer"
            :is="`my-${currentSettings.items[item.index].type}`"
            @click.native="selectHandler('bottom', layoutIndex)"
            :item="currentSettings.items[item.index]"
            :color="widget.color"
            :selected="(!!edited && edited.position === 'bottom' && edited.indexByPosition === layoutIndex)"
          />
          <add-menu class="q-ml-sm" anchor="top right" self="bottom middle" @add="(type) => addItem(type, 'bottom')" />
        </div>
      </q-card>
      <div class="complex__items-wrapper col-12 relative-position q-mb-sm" v-if="edited">
        <q-expansion-item
          :header-class="[`bg-grey-4`]"
          expand-icon="mdi-settings"
          default-opened
          style="border: solid #e0e0e0 1px"
        >
          <template slot="header">
            <q-item-section><span class="ellipsis full-width">{{editedItem.label ? `${editedItem.label} [${editedItem.type}]` : editedItem.type}}</span></q-item-section>
            <q-item-section side>
              <q-btn flat color="red-6" round dense @click="removeItem(editedItem.index)" icon="mdi-delete"/>
            </q-item-section>
          </template>
          <div class="row q-pa-sm">
            <div class="col-6 q-mb-sm">
              <q-input outlined dense hide-bottom-space autofocus class="q-mr-xs" color="grey-9" v-model="editedItem.label" label="Label"/>
            </div>
            <div class="col-6 q-mb-sm">
              <q-input outlined dense hide-bottom-space class="q-ml-xs" color="grey-9" v-model="editedItem.path" label="Path" placeholder="item[0].value"/>
            </div>
            <q-expansion-item
              v-if="editedItem.type === 'knob' || editedItem.type === 'progress'"
              class="col-12 q-mt-sm"
              default-opened
              label="Min value settings"
              :header-class="[`bg-${isValidMinValue(editedItem.index) ? 'grey-4' : 'red-2'}`]"
              style="border: solid #e0e0e0 1px"
            >
              <div class="row q-pa-sm">
                <div class="col-5 q-mb-sm">
                  <q-select outlined dense hide-bottom-space color="grey-9" v-model="editedItem.minValueMode" label="Min value source" emit-value map-options :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler(editedItem.index, 'min')"/>
                </div>
                <div class="col-12">
                  <q-input outlined dense hide-bottom-space v-if="editedItem.minValueMode === 0" type="number" color="grey-9" v-model.number="editedItem.minValue" label="Min value"/>
                  <topic v-else v-model="editedItem.minValue" label="Min value" :board="board"/>
                </div>
              </div>
            </q-expansion-item>
            <q-expansion-item
              v-if="editedItem.type === 'knob' || editedItem.type === 'progress'"
              class="col-12 q-mt-sm"
              default-opened
              label="Max value settings"
              :header-class="[`bg-${isValidMaxValue(editedItem.index) ? 'grey-4' : 'red-2'}`]"
              style="border: solid #e0e0e0 1px"
            >
              <div class="row q-pa-sm">
                <div class="col-5 q-mb-sm">
                  <q-select outlined dense hide-bottom-space color="grey-9" v-model="editedItem.maxValueMode" emit-value map-options label="Max value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler(editedItem.index, 'max')"/>
                </div>
                <div class="col-12">
                  <q-input outlined dense hide-bottom-space v-if="editedItem.maxValueMode === 0" type="number" color="grey-9" v-model.number="editedItem.maxValue" label="Max value"/>
                  <topic v-else v-model="editedItem.maxValue" label="Max value" :board="board"/>
                </div>
              </div>
            </q-expansion-item>
            <div v-if="editedItem.type === 'text'" class="row">
              <q-input outlined dense hide-bottom-space class="col-8 q-mb-sm q-pr-xs" color="grey-9" v-model="editedItem.math" label="Math expression" placeholder="%value%"/>
              <q-select outlined dense hide-bottom-space class="col-4 q-mb-sm" color="grey-9" v-model="editedItem.valueFormat" :options="formatOptions" emit-value map-options label="Format value as"/>
              <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-if="editedItem.valueFormat === constants.WIDGET_VALUE_FORMAT_DATE" v-model="editedItem.dateFormat" label="Datetime format" placeholder="DD/MM/YYYY HH:mm:ss.SSS"/>
              <div class="text-grey-7 q-mt-xs" style="font-size: 12px; line-height: 1;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
            </div>
          </div>
        </q-expansion-item>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .complex__element:hover
    background-color $grey-3
</style>

<script>
import Topic from '../Topic'
import isEqual from 'lodash/isEqual'
import validateTopic from '../../../mixins/validateTopic.js'
import {
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE,
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON,
  WIDGET_VALUE_FORMAT_DURATION
} from '../../../constants'
import AddMenu from './AddMenu'
import Text from './Text'
import Knob from './Knob'
import Progress from './Progress'
export default {
  name: 'ComplexSchema',
  props: ['widget', 'board'],
  data () {
    const defaultItem = {
      label: 'item',
      type: 'knob',
      path: '',
      position: 'top',
      minValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      minValue: 0,
      maxValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      maxValue: 100
    }
    const defaultSettings = {
      items: [],
      topics: [],
      height: 8,
      width: 4,
      maxTopicsLength: 1,
      minWidth: 2,
      minHeight: 4,
      isNeedTime: true
    }
    return {
      defaultSettings,
      constants: {
        WIDGET_VALUE_FORMAT_STRING,
        WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
        WIDGET_VALUE_FORMAT_DATE,
        WIDGET_VALUE_FORMAT_PRE,
        WIDGET_VALUE_FORMAT_MARKDOWN,
        WIDGET_VALUE_FORMAT_JSON,
        WIDGET_VALUE_FORMAT_DURATION
      },
      defaultItem,
      currentItem: Object.assign({}, defaultItem),
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      itemTypes: [
        {
          label: 'Knob',
          value: 'knob'
        },
        {
          label: 'Progress',
          value: 'progress'
        },
        {
          label: 'Text',
          value: 'text'
        }
      ],
      rangeValueModeOptions: [
        { label: 'Manual', value: WIDGET_RANGE_VALUE_CURRENT_MODE },
        { label: 'Broker', value: WIDGET_RANGE_VALUE_DATASOURCE_MODE }
      ],
      formatOptions: [
        { label: 'String', value: WIDGET_VALUE_FORMAT_STRING },
        { label: 'Human readable size, B', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE },
        { label: 'Datetime, s', value: WIDGET_VALUE_FORMAT_DATE },
        { label: 'Duration, s', value: WIDGET_VALUE_FORMAT_DURATION },
        { label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE },
        { label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN },
        { label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON }
      ],
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: '',
        topicTemplate: '',
        payloadNameField: ''
      },
      edited: null
    }
  },
  computed: {
    editedItem () {
      if (!this.edited) { return null }
      return this.currentSettings.items[this.edited.index]
    }
  },
  methods: {
    selectHandler (position, indexByPosition) {
      let index = -1
      this.currentSettings.items.reduce((currentIndex, item, indexInStore) => {
        if (item.position === position) {
          currentIndex++
          if (currentIndex === indexByPosition) {
            index = indexInStore
          }
        }
        return currentIndex
      }, -1)
      this.edited = { position, indexByPosition, index }
    },
    addItem (type, position) {
      const index = this.currentSettings.items.length
      this.currentItem.index = index
      this.currentItem.type = type
      this.currentItem.position = position
      this.currentSettings.items.push(this.currentItem)
      this.selectHandler(position, this.currentSettings.items.filter(item => item.position === position).length - 1)
      this.currentItem = Object.assign({}, this.defaultItem)
      return this.currentSettings.items.length - 1
    },
    removeItem (itemIndex) {
      this.edited = null
      this.currentSettings.items.forEach(item => {
        if (itemIndex < item.index) {
          item.index--
        }
      })
      this.$delete(this.currentSettings.items, itemIndex)
    },
    isValidMinValue (index) {
      const item = this.currentSettings.items[index]
      return (
        item.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE ||
        (
          item.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE &&
          !this.widget.dataTopics.map(topic => topic.topicFilter).includes(item.minValue.topicFilter) &&
          item.maxValue.topicFilter !== item.minValue.topicFilter &&
          this.validateTopic(item.minValue.topicFilter)
        )
      )
    },
    isValidMaxValue (index) {
      const item = this.currentSettings.items[index]
      return (
        item.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE ||
        (
          item.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE &&
          !this.widget.dataTopics.map(topic => topic.topicFilter).includes(item.maxValue.topicFilter) &&
          item.maxValue.topicFilter !== item.minValue.topicFilter &&
          this.validateTopic(item.maxValue.topicFilter)
        )
      )
    },
    changeRangeValueTypeHandler (index, type) {
      const item = this.currentSettings.items[index]
      if (type === 'min') {
        item.minValueMode ? this.$set(item, 'minValue', Object.assign({}, this.defaultTopic)) : this.$set(item, 'minValue', 0)
      } else if (type === 'max') {
        item.maxValueMode ? this.$set(item, 'maxValue', Object.assign({}, this.defaultTopic)) : this.$set(item, 'maxValue', 100)
      }
    },
    validate () {
      return this.currentSettings.items.length
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
    },
    'currentSettings.items': {
      deep: true,
      handler (items) {
        const topics = items.reduce((topics, item) => {
          if (item.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) {
            topics.push(item.minValue)
          }
          if (item.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) {
            topics.push(item.maxValue)
          }
          return topics
        }, [])
        this.$set(this.currentSettings, 'topics', topics)
      }
    }
  },
  mixins: [validateTopic],
  components: {
    Topic,
    AddMenu,
    MyText: Text,
    MyKnob: Knob,
    MyProgress: Progress
  }
}
</script>
