<template>
  <div>
    <q-toggle class="q-mt-sm" color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="grey-9" class="q-mb-sm" outlined hide-bottom-space v-model="currentSettings.label" :label="currentSettings.label.length <= 25 ? 'Button label' : 'Button label (25 symbols max)'" :error="currentSettings.label.length > 25"/>
    <q-input outlined hide-bottom-space class="q-mb-sm" color="grey-9" v-model="currentSettings.icon" label="Icon">
      <q-icon slot="append" :name="`mdi-${currentSettings.icon || 'send'}`" size="1.5rem"/>
    </q-input>
    <q-input color="grey-9" outlined hide-bottom-space v-model="currentSettings.topic" label="Topic"/>
    <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.topic += variable"/>
    <q-input type="textarea" outlined hide-bottom-space color="grey-9" class="q-mt-sm" v-model="currentSettings.payload" label="Payload" input-style="resize: none;"/>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
export default {
  name: 'ClickerSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      label: '',
      icon: '',
      topic: 'button/topic/publish',
      payload: '',
      save: false,
      height: 2,
      width: 3,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0
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
  },
  components: { VariablesHelper }
}
</script>
