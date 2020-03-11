<template>
  <div>
    <div class="row">
      <div class="col-12 q-mb-sm">
        <q-btn-toggle
          v-model="currentSettings.mode"
          rounded
          toggle-text-color="grey-9"
          text-color="grey-6"
          flat
          :options="modeOptions"
        />
      </div>
      <div class="col-12 q-mb-sm">
        <q-select outlined hide-bottom-space color="grey-9" v-model="currentSettings.format" label="Format" :options="formatOptions" emit-value map-options/>
      </div>
      <div class="col-12 q-mb-sm">
        <q-input outlined hide-bottom-space :error="!isValueTemplateValide" :hint="valueTemplateHelper" type="textarea" color="grey-9" v-model="currentSettings.valueTemplate" label="Value template"/>
      </div>
      <div class="col-12 q-mb-sm" v-if="widget.dataTopics[0] && widget.dataTopics[0].payloadType">
        <q-input outlined hide-bottom-space type="textarea" input-style="resize: none;" color="grey-9" hint="You can set publish template. %value% is variable of your color." v-model="currentSettings.publishTemplate" label="Publish template"/>
      </div>
      <q-toggle class="q-mt-sm col-12" color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      <q-toggle class="q-mt-sm col-12" color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
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
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
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
        { label: 'Simple', value: COLOR_MODE_SIMPLE },
        { label: 'Advanced', value: COLOR_MODE_FULL }
      ],
      formatOptions: [
        { label: 'HEX', value: COLOR_FORMAT_HEX },
        { label: 'RGB', value: COLOR_FORMAT_RGB },
        { label: 'HSV', value: COLOR_FORMAT_HSV }
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
      let vars = this.currentSettings.valueTemplate.match(/%[hex|r|g|b|h|s|v|a]{1,3}%/g)
      if (!vars) { return false }
      vars = vars.map(v => v.slice(1, -1))
      let flag = false
      if (this.currentSettings.format === COLOR_FORMAT_HEX) {
        flag = vars.includes('hex') && vars.length === 1
      } else if (this.currentSettings.format === COLOR_FORMAT_RGB) {
        flag = vars.reduce((res, v) => res && ['r', 'g', 'b', 'a'].includes(v), true) && vars.length > 2 && vars.length < 5
      } else if (this.currentSettings.format === COLOR_FORMAT_HSV) {
        flag = vars.reduce((res, v) => res && ['h', 's', 'v', 'a'].includes(v), true) && vars.length > 2 && vars.length < 5
      }
      return flag
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
