<template>
  <div>
    <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="dark" v-model="currentSettings.label" :float-label="currentSettings.label.length <= 25 ? 'Button label' : 'Button label (25 symbols max)'" :error="currentSettings.label.length > 25"/>
    <q-input type="textarea" color="dark" v-model="currentSettings.payload" float-label="Payload"/>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
export default {
  name: 'ClickerSchema',
  props: ['settings'],
  data () {
    let defaultSettings = {
      label: '',
      payload: '',
      save: false
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.settings)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  methods: {
    validate () {
      return this.currentSettings.label.length <= 25
    }
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('validate', this.validate())
        this.$emit('update', val)
      }
    },
    settings (settings) {
      if (isEqual(settings, this.currentSettings)) { return false }
      this.currentSettings = Object.assign({}, this.defaultSettings, settings)
    }
  }
}
</script>
