<template>
  <div class="row">
    <template  v-if="config && config.needSelectors && $flespiMode">
      <div class="col-12  q-mb-sm text-grey-8 text-subtitle2">Select source by flespi entities:</div>
      <flespi-selector :connector="$flespiRestBus" @input="selectorTopicUpdate" :variables="selectorsVariables" class="col-12"/>
      <div class="col-12 q-mb-md row">
        <hr class="q-separator q-separator--horizontal col-5" style="height: 1px; margin-top: 10px;"/>
        <div class="col-2 text-grey-8 text-center text-uppercase">or</div>
        <hr class="q-separator q-separator--horizontal col-5" style="height: 1px; margin-top: 10px;"/>
      </div>
      <div class="col-12 text-grey-8 q-mb-sm text-subtitle2"> Enter its manually:</div>
    </template>
    <q-input dense autofocus outlined hide-bottom-space class="col-8 q-pr-sm" color="grey-9" v-model="currentValue.topicTemplate" @input="currentValue.topicFilter = currentValue.topicTemplate" label="Topic" :error="!validateTopic(currentValue.topicFilter)"/>
    <q-select dense class="col-4" outlined hide-bottom-space color="grey-9" v-model="currentValue.payloadType" emit-value map-options label="Payload type" :options="payloadTypeOptions"/>
    <variables-helper class="col-12" v-if="board && board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentValue.topicTemplate += variable"/>
    <q-input dense outlined hide-bottom-space v-if="currentValue.payloadType === WIDGET_PAYLOAD_TYPE_JSON" color="grey-9" class="col-12 q-mt-sm" v-model="currentValue.payloadField" label="Payload path" hint="You can set path in result JSON. Path started from root of object. Example: names[0].value"/>
    <q-input dense outlined hide-bottom-space v-if="config && config.needLabel && currentValue.payloadType === WIDGET_PAYLOAD_TYPE_JSON" color="grey-9" class="col-12 q-mt-sm" v-model="currentValue.payloadNameField" label="Value`s label" hint="Value`s label gets from resilt JSON by path. Example: names[0].label"/>
  </div>
</template>

<script>
import validateTopic from '../../mixins/validateTopic.js'
import VariablesHelper from './VariablesHelper'
import FlespiSelector from '../selectors/Selectors'
import {
  WIDGET_PAYLOAD_TYPE_STRING,
  WIDGET_PAYLOAD_TYPE_JSON
} from '../../constants'
export default {
  name: 'Topic',
  props: ['value', 'board', 'config'],
  /* config = { needLabel, needSelectors } */
  data () {
    const defaultTopic = {
        topicTemplate: '',
        topicFilter: '',
        payloadType: 0,
        payloadField: '',
        payloadNameField: ''
      },
      currentValue = Object.assign({}, this.defaultTopic, this.value)
    if (!currentValue.topicTemplate) {
      currentValue.topicTemplate = currentValue.topicFilter
    }
    return {
      defaultTopic,
      currentValue,
      WIDGET_PAYLOAD_TYPE_STRING,
      WIDGET_PAYLOAD_TYPE_JSON,
      payloadTypeOptions: [
        { label: 'String', value: WIDGET_PAYLOAD_TYPE_STRING },
        { label: 'JSON', value: WIDGET_PAYLOAD_TYPE_JSON }
      ]
    }
  },
  computed: {
    selectorsVariables () {
      let vars = []
      if (this.board && this.board.settings.variables && this.board.settings.variables.length) {
        vars = this.board.settings.variables.map(variable => ({ label: variable.name, value: variable.name }))
      }
      return vars
    }
  },
  watch: {
    currentValue: {
      deep: true,
      handler (val) { this.$emit('input', val) }
    }
  },
  methods: {
    selectorTopicUpdate ({ topic: { topicPattern, payloadType } }) {
      this.$set(this.currentValue, 'topicTemplate', topicPattern)
      this.$set(this.currentValue, 'topicFilter', topicPattern)
      payloadType = payloadType === 'JSON' ? WIDGET_PAYLOAD_TYPE_JSON : WIDGET_PAYLOAD_TYPE_STRING
      this.$set(this.currentValue, 'payloadType', payloadType)
    }
  },
  mixins: [validateTopic],
  components: { VariablesHelper, FlespiSelector }
}
</script>
