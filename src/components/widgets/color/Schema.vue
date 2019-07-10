<template>
  <div>
    <div class="row">
      <div class="col-12 q-mt-lg">
        <q-btn-toggle
          v-model="currentSettings.mode"
          rounded
          toggle-text-color="dark"
          text-color="grey-6"
          flat
          :options="modeOptions"
        />
      </div>
      <div class="col-12">
        <q-select color="dark" v-model="currentSettings.format" float-label="Format" :options="formatOptions"/>
      </div>
      <div class="col-12">
        <q-field :helper="valueTemplateHelper">
          <div>
            <q-input :error="!isValueTemplateValide" type="textarea" color="dark" v-model="currentSettings.valueTemplate" float-label="Value template"/>
          </div>
        </q-field>
      </div>
      <div class="col-12" v-if="widget.dataTopics[0] && widget.dataTopics[0].payloadType">
        <q-field helper="You can set publish template. %value% is variable of your color.">
          <div>
            <q-input type="textarea" color="dark" v-model="currentSettings.publishTemplate" float-label="Publish template"/>
          </div>
        </q-field>
      </div>
      <q-toggle class="q-mt-sm col-12" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      <q-toggle class="q-mt-sm col-12" color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
    </div>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import {
  COLOR_FORMAT_HEX,
  COLOR_FORMAT_RGB,
  COLOR_FORMAT_HSV,
  COLOR_MODE_SIMPLE,
  COLOR_MODE_FULL
} from './constants'
export default {
  name: 'ColorSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      publishTemplate: '',
      valueTemplate: '',
      format: COLOR_FORMAT_HEX,
      mode: COLOR_MODE_SIMPLE,
      save: true,
      width: 2,
      minWidth: 2,
      height: 6,
      minHeight: 6,
      maxTopicsLength: 1,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      modeOptions: [
        {label: 'Simple', value: COLOR_MODE_SIMPLE},
        {label: 'Advanced', value: COLOR_MODE_FULL}
      ],
      formatOptions: [
        {label: 'HEX', value: COLOR_FORMAT_HEX},
        {label: 'RGB', value: COLOR_FORMAT_RGB},
        {label: 'HSV', value: COLOR_FORMAT_HSV}
      ]
    }
  },
  computed: {
    valueTemplateHelper () {
      let heplper = 'You can set a template of publish string. Variables to use in this case: '
      switch (this.currentSettings.format) {
        case COLOR_FORMAT_HEX: {
          heplper += '%hex%.'
          break
        }
        case COLOR_FORMAT_RGB: {
          heplper += '%r%, %g%, %b%, %a%.'
          break
        }
        case COLOR_FORMAT_HSV: {
          heplper += '%h%, %s%, %v%, %a%.'
          break
        }
      }
      return heplper
    },
    isValueTemplateValide () {
      if (!this.currentSettings.valueTemplate) { return true }
      let vars = this.currentSettings.valueTemplate.match(/%.{1,3}%/g)
      if (!vars) { return false }
      vars = vars.map(v => v.slice(1, -1))
      if (this.currentSettings.format === COLOR_FORMAT_HEX) {
        return vars.includes('hex') && vars.length === 1
      } else if (this.currentSettings.format === COLOR_FORMAT_RGB) {
        return vars.reduce((res, v) => res && ['r', 'g', 'b', 'a'].includes(v), true) && vars.length > 2 && vars.length < 5
      } else if (this.currentSettings.format === COLOR_FORMAT_HSV) {
        return vars.reduce((res, v) => res && ['h', 's', 'v', 'a'].includes(v), true) && vars.length > 2 && vars.length < 5
      }
    }
  },
  methods: {
    validate () {
      return this.isValueTemplateValide
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    widget: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', this.currentSettings)
      }
    },
    'widget.dataTopics.0.payloadType' (type) {
      if (!type) {
        this.currentSettings.publishTemplate = ''
      }
    }
  }
}
</script>
