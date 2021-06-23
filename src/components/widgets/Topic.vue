<template>
  <div class="row">
    <q-slide-transition>
      <flespi-selector v-if="shownSelectors" :value="this.currentValue.topicTemplate" :connector="$flespiRestBus" @input="selectorTopicUpdate" :variables="selectorsVariables" class="col-12"/>
    </q-slide-transition>
    <q-input dense :autofocus="config && config.needAutofocus" outlined hide-bottom-space class="col-8 q-pr-sm" color="grey-9" v-model="currentValue.topicTemplate" @input="currentValue.topicFilter = currentValue.topicTemplate" label="Topic" :error="!validateTopic(currentValue.topicFilter)">
      <q-btn slot="append" v-if="config && config.needSelectors && $flespiMode" flat round color="red" icon="icon-flespi2-02-01" @click="shownSelectors = !shownSelectors">
        <q-tooltip>flespi topic helper</q-tooltip>
      </q-btn>
    </q-input>
    <q-select dense class="col-4" outlined hide-bottom-space color="grey-9" v-model="currentValue.payloadType" emit-value map-options label="Payload type" :options="payloadTypeOptions"/>
    <variables-helper class="col-12" v-if="board && board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentValue.topicTemplate += variable"/>
    <q-input dense outlined hide-bottom-space v-if="currentValue.payloadType === WIDGET_PAYLOAD_TYPE_JSON" color="grey-9" class="col-12 q-mt-sm" v-model="currentValue.payloadField" label="Payload path" hint="You can set path in result JSON. Path started from root of object. Example: names[0].value"/>
    <q-input dense outlined hide-bottom-space v-if="config && config.needLabel && currentValue.payloadType === WIDGET_PAYLOAD_TYPE_JSON" color="grey-9" class="col-12 q-mt-sm" v-model="currentValue.payloadNameField" label="Value`s label" hint="Value`s label gets from resilt JSON by path. Example: names[0].label"/>
    <q-input dense outlined hide-bottom-space v-if="config && config.needDefault" color="grey-9" class="col-12 q-mt-sm" v-model="currentValue.default" label="Default value" hint="If you currently have no any value by this subscription, you can set an empty state value"/>
  </div>
</template>

<script>
import validateTopic from '../../mixins/validateTopic.js'
import VariablesHelper from './VariablesHelper'
import FlespiSelector from '../selectors/Selectors'
import { getTopicModel } from '../../constants/defaultes'
import {
  WIDGET_PAYLOAD_TYPE_STRING,
  WIDGET_PAYLOAD_TYPE_JSON
} from '../../constants'
export default {
  name: 'Topic',
  props: ['value', 'board', 'config'],
  /* config = { needLabel, needSelectors, needAutofocus, needDefault } */
  data () {
    const defaultTopic = getTopicModel(),
      currentValue = Object.assign({}, this.defaultTopic, this.value)
    if (!currentValue.topicTemplate) {
      currentValue.topicTemplate = currentValue.topicFilter
    }
    return {
      defaultTopic,
      currentValue,
      WIDGET_PAYLOAD_TYPE_STRING,
      WIDGET_PAYLOAD_TYPE_JSON,
      shownSelectors: false,
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
    },
    value (value) { this.currentValue = value }
  },
  methods: {
    selectorTopicUpdate ({ topic: { topicPattern, payloadType } }) {
      if (!topicPattern) { return false }
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
