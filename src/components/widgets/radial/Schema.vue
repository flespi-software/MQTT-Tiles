<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-sm-2 q-pr-xs">
        <q-select color="dark" v-model="currentSettings.payloadType" :options="payloadTypeOptions" float-label="Payload type" @input="changePayloadTypeHandler"/>
      </div>
      <div class="col-xs-12 col-sm-10 q-pl-xs">
        <q-input v-if="currentSettings.payloadType === 1" color="dark"  v-model="currentSettings.payloadField" float-label="Guage field"/>
      </div>
      <div class="col-3">
        <q-input v-if="currentSettings.minValueMode === 0" type="number" color="dark" v-model="currentSettings.minValue" float-label="Min value"/>
        <q-input v-else color="dark" v-model="currentSettings.minValueTopic" float-label="Min value topic" :error="!widget.topics.includes(currentSettings.minValueTopic)"/>
      </div>
      <div class="col-3">
        <q-select class="q-mr-sm" color="dark" v-model="currentSettings.minValueMode" float-label="Min value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler"/>
      </div>
      <div class="col-3">
        <q-input v-if="currentSettings.maxValueMode === 0" class="q-ml-sm" type="number" color="dark" v-model="currentSettings.maxValue" float-label="Max value"/>
        <q-input v-else class="q-ml-sm" color="dark" v-model="currentSettings.maxValueTopic" float-label="Max value topic"  :error="!widget.topics.includes(currentSettings.maxValueTopic)"/>
      </div>
      <div class="col-3">
        <q-select color="dark" v-model="currentSettings.maxValueMode" float-label="Max value source" :options="rangeValueModeOptions" @input="changeRangeValueTypeHandler"/>
      </div>
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
    </div>
  </div>
</template>

<script>
import {
  WIDGET_PAYLOAD_TYPE_NUMBER,
  WIDGET_PAYLOAD_TYPE_JSON,
  WIDGET_RANGE_VALUE_CURRENT_MODE,
  WIDGET_RANGE_VALUE_DATASOURCE_MODE
} from '../../../constants'
export default {
  name: 'RadialSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      lowLevel: 60,
      midLevel: 100,
      highLevel: 120,
      minValue: 0,
      minValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      minValueTopic: 'min-value-topic',
      maxValue: 250,
      maxValueMode: WIDGET_RANGE_VALUE_CURRENT_MODE,
      maxValueTopic: 'max-value-topic',
      units: '',
      height: 6,
      width: 3,
      payloadType: WIDGET_PAYLOAD_TYPE_NUMBER,
      payloadField: '',
      maxTopicsLength: 1,
      minWidth: 2,
      minHeight: 4
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      payloadTypeOptions: [
        {label: 'Number', value: WIDGET_PAYLOAD_TYPE_NUMBER},
        {label: 'JSON', value: WIDGET_PAYLOAD_TYPE_JSON}
      ],
      rangeValueModeOptions: [
        {label: 'Current', value: WIDGET_RANGE_VALUE_CURRENT_MODE},
        {label: 'Datasource', value: WIDGET_RANGE_VALUE_DATASOURCE_MODE}
      ]
    }
  },
  methods: {
    changePayloadTypeHandler (type) {
      if (!type) {
        this.currentSettings.payloadField = ''
      }
    },
    changeRangeValueTypeHandler () {
      let topicsLength = 1
      if (this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) { topicsLength++ }
      if (this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE) { topicsLength++ }
      this.currentSettings.maxTopicsLength = topicsLength
    },
    validate () {
      return (this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE || (this.currentSettings.minValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE && this.widget.topics.includes(this.currentSettings.minValueTopic))) &&
        (this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_CURRENT_MODE || (this.currentSettings.maxValueMode === WIDGET_RANGE_VALUE_DATASOURCE_MODE && this.widget.topics.includes(this.currentSettings.maxValueTopic)))
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    widget: {
      deep: true,
      handler (val) {
        this.$emit('validate', this.validate())
        this.$emit('update', this.currentSettings)
      }
    }
  }
}
</script>
