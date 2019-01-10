<template>
  <div>
    <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="dark" v-model="currentSettings.trueValue" float-label="True value"/>
    <q-input color="dark" v-model="currentSettings.falseValue" float-label="False value"/>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
export default {
  name: 'SwitcherSchema',
  props: ['settings'],
  data () {
    let defaultSettings = {
      trueValue: '1',
      falseValue: '0',
      save: true,
      height: 1,
      width: 2
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.settings)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) { this.$emit('update', val) }
    },
    settings (settings) {
      if (isEqual(settings, this.currentSettings)) { return false }
      this.currentSettings = Object.assign({}, this.defaultSettings, settings)
    }
  }
}
</script>
