<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      </div>
      <q-btn-toggle class='q-mt-md col-12' rounded toggle-text-color="dark" text-color="grey-6" flat v-model="currentSettings.mode" :options="modeOptions"/>
      <q-input class="col-12" v-if="currentSettings.mode === 0 && widget.topics.length > 1" color="dark" v-model="currentSettings.actionTopic" float-label="Action topic"/>
      <div class="col-6 q-pr-sm">
        <q-input color="dark" v-model="currentSettings.trueValue" float-label="True value"/>
        <q-input v-if="currentSettings.mode === 1" color="dark" v-model="currentSettings.trueActionTopic" float-label="True action topic" :after="[{icon: 'mdi-arrow-right', handler () { currentSettings.falseActionTopic = currentSettings.trueActionTopic }, content: true}]"/>
        <q-input v-if="currentSettings.mode === 1" color="dark" v-model="currentSettings.truePayload" float-label="True action payload" :after="[{icon: 'mdi-arrow-right', handler () { currentSettings.falsePayload = currentSettings.truePayload }, content: true}]"/>
      </div>
      <div class="col-6 q-pl-sm">
        <q-input color="dark" v-model="currentSettings.falseValue" float-label="False value"/>
        <q-input v-if="currentSettings.mode === 1" color="dark" v-model="currentSettings.falseActionTopic" float-label="False action topic"/>
        <q-input v-if="currentSettings.mode === 1" color="dark" v-model="currentSettings.falsePayload" float-label="False action payload"/>
      </div>
      <div class='q-my-md col-12' v-if="widget.topics.length > 1">
        <div class="text-grey-6" style="font-size: 0.75rem">Accumulate logic</div>
        <q-btn-toggle rounded toggle-text-color="dark" text-color="grey-6" flat v-model="currentSettings.accumulateLogic" :options="accumulateLogicOptions"/>
        <div class="text-grey-6" style="font-size: 0.75rem">How value will be accumulating*</div>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_MODE, COMMAND_MODE, ACCUMULATE_AND_MODE, ACCUMULATE_OR_MODE } from './constants.js'
export default {
  name: 'SwitcherSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      actionTopic: '',
      trueValue: '1',
      trueActionTopic: '',
      truePayload: '',
      falseValue: '0',
      falseActionTopic: '',
      falsePayload: '',
      accumulateLogic: ACCUMULATE_AND_MODE,
      save: true,
      mode: DEFAULT_MODE,
      height: 1,
      width: 2
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      modeOptions: [
        {label: 'Default mode', value: DEFAULT_MODE},
        {label: 'Command mode', value: COMMAND_MODE}
      ],
      accumulateLogicOptions: [
        {label: 'AND', value: ACCUMULATE_AND_MODE},
        {label: 'OR', value: ACCUMULATE_OR_MODE}
      ]
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
