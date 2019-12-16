<template>
  <div>
    <div class="row">
      <div class="col-xs-12 q-mb-sm">
        <q-select outlined hide-bottom-space color="grey-9" v-model="currentSettings.valueFormat" :options="formatOptions" emit-value map-options label="Format value as"/>
      </div>
      <div class="col-xs-12">
        <q-input outlined hide-bottom-space color="grey-9" :max-height="300" type="textarea" v-model="currentSettings.text" label="Text" input-style="resize: none;"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON
} from '../../../constants'
export default {
  name: 'StaticInformerSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      valueFormat: 0,
      text: '',
      height: 2,
      width: 2,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      formatOptions: [
        { label: 'String', value: WIDGET_VALUE_FORMAT_STRING },
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
