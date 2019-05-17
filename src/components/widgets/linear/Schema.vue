<template>
  <div>
    <div class="row">
      <q-collapsible
        class="col-12 q-mt-sm"
        :opened="true"
        label="Min value settings"
        :header-class="[`bg-${isValidMinValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row">
          <div class="col-3">
            <q-select color="dark" v-model="currentSettings.minValueMode" float-label="Min value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler('min')"/>
          </div>
          <div class="col-12">
            <q-input v-if="currentSettings.minValueMode === 0" type="number" color="dark" v-model="currentSettings.minValue" float-label="Min value"/>
            <topic v-else v-model="minValue" label="Min value"/>
            <!-- <q-input v-else color="dark" v-model="minValue" float-label="Min value topic" :error="widget.dataTopics.includes(currentSettings.topics[0]) || !validateTopic(currentSettings.topics[0])"/> -->
          </div>
        </div>
      </q-collapsible>
      <q-collapsible
        class="col-12 q-mt-sm"
        :opened="true"
        label="Max value settings"
        :header-class="[`bg-${isValidMaxValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row">
          <div class="col-3">
            <q-select color="dark" v-model="currentSettings.maxValueMode" float-label="Max value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler('max')"/>
          </div>
          <div class="col-12">
            <q-input v-if="currentSettings.maxValueMode === 0" type="number" color="dark" v-model="currentSettings.maxValue" float-label="Max value"/>
            <topic v-else v-model="maxValue" label="Max value"/>
            <!-- <q-input v-else color="dark" v-model="maxValue" float-label="Max value topic" :error="widget.dataTopics.includes(currentSettings.topics[1]) || !validateTopic(currentSettings.topics[1])"/> -->
          </div>
        </div>
      </q-collapsible>
      <div class="col-4">
        <q-input class="q-mr-sm" type="number" color="dark" v-model="currentSettings.lowLevel" float-label="Low level"/>
      </div>
      <div class="col-4">
        <q-input class="q-mx-sm" type="number" color="dark" v-model="currentSettings.midLevel" float-label="Mid level"/>
      </div>
      <div class="col-4">
        <q-input class="q-ml-sm" type="number" color="dark" v-model="currentSettings.highLevel" float-label="High level"/>
      </div>
      <div class="col-4">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.units" float-label="Units"/>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import Topic from '../Topic'
import validateTopic from '../../../mixins/validateTopic.js'
import {
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
export default {
  name: 'LinearSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
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
        {label: 'Manual', value: WIDGET_RANGE_VALUE_CURRENT_MODE},
        {label: 'Broker', value: WIDGET_RANGE_VALUE_DATASOURCE_MODE}
      ],
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      }
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
      let topics = []
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
  components: {Topic},
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
