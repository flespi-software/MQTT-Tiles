<template>
  <div>
    <div class="row">
      <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model="currentSettings.math" label="Math expression" placeholder="%value%"/>
      <div class="text-grey-9" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
      <q-expansion-item
        class="col-12 q-mt-sm"
        default-opened
        label="Min value settings"
        :header-class="[`bg-${isValidMinValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row q-pa-sm">
          <div class="col-3 q-mb-sm">
            <q-select outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.minValueMode" emit-value map-options label="Min value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler('min')"/>
          </div>
          <div class="col-12">
            <q-input outlined dense hide-bottom-space v-if="currentSettings.minValueMode === 0" type="number" v-model.number="currentSettings.minValue" color="grey-9" label="Min value"/>
            <topic v-else v-model="minValue" label="Min value" :board="board" :config="{ needDefault: true }"/>
          </div>
        </div>
      </q-expansion-item>
      <q-expansion-item
        class="col-12 q-my-sm"
        default-opened
        label="Max value settings"
        :header-class="[`bg-${isValidMaxValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row q-pa-sm">
          <div class="col-3 q-mb-sm">
            <q-select outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.maxValueMode" emit-value map-options label="Max value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler('max')"/>
          </div>
          <div class="col-12">
            <q-input outlined dense hide-bottom-space v-if="currentSettings.maxValueMode === 0" type="number" color="grey-9" v-model.number="currentSettings.maxValue" label="Max value"/>
            <topic v-else v-model="maxValue" label="Max value" :board="board" :config="{ needDefault: true }"/>
          </div>
        </div>
      </q-expansion-item>
      <div class="col-4 q-mb-sm">
        <q-input outlined dense hide-bottom-space class="q-mr-sm" type="number" color="grey-9" v-model.number="currentSettings.lowLevel" label="Low level"/>
      </div>
      <div class="col-4">
        <q-input outlined dense hide-bottom-space class="q-mx-sm" type="number" color="grey-9" v-model.number="currentSettings.midLevel" label="Mid level"/>
      </div>
      <div class="col-4">
        <q-input outlined dense hide-bottom-space class="q-ml-sm" type="number" color="grey-9" v-model.number="currentSettings.highLevel" label="High level"/>
      </div>
      <div class="col-4">
        <q-input outlined dense hide-bottom-space class="q-mr-sm" color="grey-9" v-model="currentSettings.units" label="Units"/>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import Topic from '../Topic'
import validateTopic from '../../../mixins/validateTopic.js'
import { getTopicModel } from '../../../constants/defaultes'
import {
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
export default {
  name: 'LinearSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      math: '',
      lowLevel: 60,
      midLevel: 100,
      highLevel: 120,
      minValue: 0,
      topics: [],
      minValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      maxValue: 250,
      maxValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      units: '',
      height: 8,
      width: 1,
      maxTopicsLength: 1,
      minWidth: 1,
      minHeight: 2,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      rangeValueModeOptions: [
        { label: 'Manual', value: WIDGET_RANGE_VALUE_CURRENT_MODE },
        { label: 'Broker', value: WIDGET_RANGE_VALUE_DATASOURCE_MODE }
      ],
      defaultTopic: getTopicModel()
    }
  },
  computed: {
    minValue: {
      get () {
        return this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
          ? this.currentSettings.minValue
          : this.currentSettings.topics[0]
      },
      set (val) {
        Vue.set(this.currentSettings.topics, 0, val)
      }
    },
    maxValue: {
      get () {
        return this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
          ? this.currentSettings.maxValue
          : this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
            ? this.currentSettings.topics[0]
            : this.currentSettings.topics[1]
      },
      set (val) {
        this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE
          ? Vue.set(this.currentSettings.topics, 0, val)
          : Vue.set(this.currentSettings.topics, 1, val)
      }
    },
    isValidMinValue () {
      return (
        this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE ||
        (
          this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE &&
          !this.widget.dataTopics.map(topic => topic.topicFilter).includes(this.minValue.topicFilter) &&
          this.maxValue.topicFilter !== this.minValue.topicFilter &&
          this.validateTopic(this.minValue.topicFilter)
        )
      )
    },
    isValidMaxValue () {
      return (
        this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE ||
        (
          this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE &&
          !this.widget.dataTopics.map(topic => topic.topicFilter).includes(this.maxValue.topicFilter) &&
          this.maxValue.topicFilter !== this.minValue.topicFilter &&
          this.validateTopic(this.maxValue.topicFilter)
        )
      )
    }
  },
  methods: {
    changeRangeValueTypeHandler (type) {
      const topics = []
      if (this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) {
        if (type === 'max') {
          topics.push(this.currentSettings.topics[0])
        } else {
          topics.push(Object.assign({}, this.defaultTopic))
        }
      }
      if (this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) {
        if (type === 'min') {
          if (this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) {
            topics.push(this.currentSettings.topics[0])
          } else {
            topics.push(this.currentSettings.topics[1])
          }
        } else {
          topics.push(Object.assign({}, this.defaultTopic))
        }
      }
      Vue.set(this.currentSettings, 'topics', topics)
    },
    validate () {
      return this.isValidMinValue && this.isValidMaxValue
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  mixins: [validateTopic],
  components: { Topic },
  watch: {
    widget: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', this.currentSettings)
      }
    }
  }
}
</script>
