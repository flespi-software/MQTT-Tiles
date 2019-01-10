<template>
  <div>
    <q-input color="dark" v-model="currentSettings.prefix" float-label="Prefix"/>
    <q-input color="dark" v-model="currentSettings.postfix" float-label="Postfix"/>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
export default {
  name: 'InformerSchema',
  props: ['settings'],
  data () {
    let defaultSettings = {
      prefix: '',
      postfix: '',
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
