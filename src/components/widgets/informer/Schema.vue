<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-sm-2 q-pr-xs">
        <q-select color="dark" v-model="currentSettings.payloadType" :options="payloadTypeOptions" float-label="Payload type" @input="changePayloadTypeHandler"/>
      </div>
      <div class="col-xs-12 col-sm-10 q-pl-xs">
        <q-input v-if="currentSettings.payloadType === 1" color="dark"  v-model="currentSettings.payloadField" float-label="Payload field"/>
      </div>
      <div class="col-6">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.prefix" float-label="Prefix"/>
      </div>
      <div class="col-6">
        <q-input class="q-ml-sm" color="dark" v-model="currentSettings.postfix" float-label="Postfix"/>
      </div>
    </div>
  </div>
</template>

<script>
import { WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../../../constants'
export default {
  name: 'InformerSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      prefix: '',
      postfix: '',
      height: 2,
      width: 2,
      payloadType: WIDGET_PAYLOAD_TYPE_STRING,
      payloadField: '',
      minWidth: 2,
      minHeight: 2
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      payloadTypeOptions: [
        {label: 'String', value: WIDGET_PAYLOAD_TYPE_STRING},
        {label: 'JSON', value: WIDGET_PAYLOAD_TYPE_JSON}
      ]
    }
  },
  methods: {
    changePayloadTypeHandler (type) {
      if (!type) {
        this.currentSettings.payloadField = ''
      }
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('update', val)
      }
    }
  }
}
</script>
