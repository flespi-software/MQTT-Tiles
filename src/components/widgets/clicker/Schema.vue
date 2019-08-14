<template>
  <div>
    <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="dark" v-model="currentSettings.label" :float-label="currentSettings.label.length <= 25 ? 'Button label' : 'Button label (25 symbols max)'" :error="currentSettings.label.length > 25"/>
    <q-input class="q-mr-xs icon-input" color="dark" v-model="currentSettings.icon" float-label="Icon">
      <q-icon :name="`mdi-${currentSettings.icon || 'send'}`" size="1.5rem" style="position: absolute; right: 0; bottom : 7px;"/>
    </q-input>
    <q-input color="dark" v-model="currentSettings.topic" float-label="Topic"/>
    <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.topic += variable"/>
    <q-input type="textarea" color="dark" v-model="currentSettings.payload" float-label="Payload"/>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
export default {
  name: 'ClickerSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
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
