<template>
  <div>
    <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="dark" v-model="currentSettings.label" :float-label="currentSettings.label.length <= 25 ? 'Button label' : 'Button label (25 symbols max)'" :error="currentSettings.label.length > 25"/>
    <q-input type="textarea" color="dark" v-model="currentSettings.payload" float-label="Payload"/>
  </div>
</template>

<script>
export default {
  name: 'ClickerSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      label: '',
      payload: '',
      save: false,
      height: 1,
      width: 3,
      single: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings)
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
    }
  }
}
</script>
