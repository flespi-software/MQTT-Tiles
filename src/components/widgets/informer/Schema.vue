<template>
  <div>
    <div class="row">
      <div class="col-6">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.prefix" float-label="Prefix"/>
      </div>
      <div class="col-6">
        <q-input class="q-ml-sm" color="dark" v-model="currentSettings.postfix" float-label="Postfix"/>
      </div>
      <div class="col-12">
        <q-field helper="You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.">
          <div class="row">
            <q-input class="col-8" color="dark" v-model="currentSettings.math" float-label="Math expression" placeholder="%value%"/>
            <q-select class="col-4" color="dark" v-model="currentSettings.valueFormat" :options="formatOptions" float-label="Format value as"/>
          </div>
        </q-field>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON,
  WIDGET_VALUE_FORMAT_TIME
} from '../../../constants'
export default {
  name: 'InformerSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      math: '',
      valueFormat: 0,
      prefix: '',
      postfix: '',
      height: 2,
      width: 2,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 1,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      formatOptions: [
        {label: 'String', value: WIDGET_VALUE_FORMAT_STRING},
        {label: 'Human readable size', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE},
        {label: 'Date', value: WIDGET_VALUE_FORMAT_DATE},
        {label: 'Time', value: WIDGET_VALUE_FORMAT_TIME},
        {label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE},
        {label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN},
        {label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON}
      ]
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
