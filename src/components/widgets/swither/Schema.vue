<template>
  <div>
    <q-input color="dark" v-model="currentSettings.actionTopic" float-label="Action topic (topic for publishing)"/>
    <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="dark" v-model="currentSettings.trueValue" float-label="True value"/>
    <q-input color="dark" v-model="currentSettings.falseValue" float-label="False value"/>
  </div>
</template>

<script>
export default {
  name: 'SwitcherSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      actionTopic: '',
      trueValue: '1',
      falseValue: '0',
      save: true,
      height: 1,
      width: 2
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) { this.$emit('update', val) }
    }
  }
}
</script>
