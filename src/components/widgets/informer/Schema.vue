<template>
  <div>
    <div class="row">
      <div class="col-6 q-mb-sm">
        <q-input outlined dense hide-bottom-space class="q-mr-sm" color="grey-9" v-model="currentSettings.prefix" label="Prefix"/>
      </div>
      <div class="col-6 q-mb-sm">
        <q-input outlined dense hide-bottom-space class="q-ml-sm" color="grey-9" v-model="currentSettings.postfix" label="Postfix"/>
      </div>
      <q-input outlined dense hide-bottom-space class="col-8 q-mb-sm q-pr-xs" color="grey-9" v-model="currentSettings.math" label="Math expression" placeholder="%value%"/>
      <q-select outlined dense hide-bottom-space class="col-4 q-mb-sm" color="grey-9" v-model="currentSettings.valueFormat" :options="formatOptions" emit-value map-options label="Format value as"/>
      <q-input outlined dense hide-bottom-space class="col-12 q-mb-sm" color="grey-9" v-if="currentSettings.valueFormat === constants.WIDGET_VALUE_FORMAT_DATE" v-model="currentSettings.dateFormat" label="Datetime format" placeholder="DD/MM/YYYY HH:mm:ss.SSS"/>
      <div class="col-12 text-grey-7" style="font-size: 12px; line-height: 1">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
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
  WIDGET_VALUE_FORMAT_DURATION
} from '../../../constants'
export default {
  name: 'InformerSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
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
      constants: {
        WIDGET_VALUE_FORMAT_STRING,
        WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
        WIDGET_VALUE_FORMAT_DATE,
        WIDGET_VALUE_FORMAT_PRE,
        WIDGET_VALUE_FORMAT_MARKDOWN,
        WIDGET_VALUE_FORMAT_JSON,
        WIDGET_VALUE_FORMAT_DURATION
      },
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      formatOptions: [
        { label: 'String', value: WIDGET_VALUE_FORMAT_STRING },
        { label: 'Human readable size, B', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE },
        { label: 'Datetime, s', value: WIDGET_VALUE_FORMAT_DATE },
        { label: 'Duration, s', value: WIDGET_VALUE_FORMAT_DURATION },
        { label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE },
        { label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN },
        { label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON }
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
