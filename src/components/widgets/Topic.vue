<template>
  <div class="row">
    <q-input autofocus class="col-8" color="dark" v-model="currentValue.topicFilter" float-label="Topic" :error="!validateTopic(currentValue.topicFilter)"/>
    <q-select class="col-4" color="dark" v-model="currentValue.payloadType" float-label="Payload type" :options="payloadTypeOptions"/>
    <q-field class="col-12" helper="You can set path in result JSON. Path started from root of object. Example: names[0].value" v-if="currentValue.payloadType === WIDGET_PAYLOAD_TYPE_JSON" >
      <q-input color="dark" v-model="currentValue.payloadField" float-label="Payload path"/>
    </q-field>
  </div>
</template>

<script>
import validateTopic from '../../mixins/validateTopic.js'
import {
  WIDGET_PAYLOAD_TYPE_STRING,
  WIDGET_PAYLOAD_TYPE_JSON
} from '../../constants'
export default {
  name: 'Topic',
  props: {
    value: Object
  },
  data () {
    return {
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      },
      currentValue: Object.assign({}, this.defaultTopic, this.value),
      WIDGET_PAYLOAD_TYPE_STRING,
      WIDGET_PAYLOAD_TYPE_JSON,
      payloadTypeOptions: [
        { label: 'String', value: WIDGET_PAYLOAD_TYPE_STRING },
        { label: 'JSON', value: WIDGET_PAYLOAD_TYPE_JSON }
      ]
    }
  },
  watch: {
    currentValue: {
      deep: true,
      handler (val) { this.$emit('input', val) }
    }
  },
  mixins: [validateTopic]
}
</script>
