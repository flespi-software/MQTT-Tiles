<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      </div>
      <q-btn-toggle class='q-my-sm col-12' rounded toggle-text-color="grey-9" text-color="grey-6" flat v-model="currentSettings.mode" :options="modeOptions"/>
      <q-input outlined dense hide-bottom-space class="col-12 q-mb-sm" v-if="currentSettings.mode === 0 && widget.topics.length > 1" color="grey-9" v-model="currentSettings.actionTopic" label="Action topic"/>
      <div class="col-6 q-pr-sm">
        <!-- <q-input outlined dense hide-bottom-space color="grey-9" class="q-mb-sm" v-model="currentSettings.trueValue" label="True value"/> -->
        <typed-input class="q-mb-sm" v-model="currentSettings.trueValue" :settings="{ label: 'True value' }"/>
        <q-input outlined dense hide-bottom-space class="q-mb-sm" color="grey-9" v-model="currentSettings.trueIcon" label="True value icon">
          <q-icon slot="append" :name="`mdi-${currentSettings.trueIcon || 'toggle-switch-outline'}`" size="1.5rem"/>
        </q-input>
        <div v-if="currentSettings.mode === 1" class="q-mb-sm">
          <q-input outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.trueActionTopic" label="True action topic">
            <q-btn slot="after" icon="mdi-arrow-right" dense flat @click="currentSettings.falseActionTopic = currentSettings.trueActionTopic" v-if="!!currentSettings.trueActionTopic"/>
          </q-input>
          <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.trueActionTopic += variable"/>
        </div>
        <q-input outlined dense hide-bottom-space v-if="currentSettings.mode === 1" color="grey-9" v-model="currentSettings.truePayload" label="True action payload">
          <q-btn slot="after" icon="mdi-arrow-right" dense flat @click="currentSettings.falsePayload = currentSettings.truePayload" v-if="!!currentSettings.truePayload" />
        </q-input>
      </div>
      <div class="col-6 q-pl-sm">
        <typed-input class="q-mb-sm" v-model="currentSettings.falseValue" :settings="{ label: 'False value' }"/>
        <q-input outlined dense hide-bottom-space class="q-mb-sm" color="grey-9" v-model="currentSettings.falseIcon" label="False value icon">
          <q-icon slot="append" :name="`mdi-${currentSettings.falseIcon || 'toggle-switch-off-outline'}`" size="1.5rem"/>
        </q-input>
        <div v-if="currentSettings.mode === 1" class="q-mb-sm">
          <q-input outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.falseActionTopic" label="False action topic"/>
          <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.falseActionTopic += variable"/>
        </div>
        <q-input outlined dense hide-bottom-space v-if="currentSettings.mode === 1" color="grey-9" v-model="currentSettings.falsePayload" label="False action payload"/>
      </div>
      <q-input outlined dense hide-bottom-space class="col-12 q-mt-sm" color="grey-9" v-model="currentSettings.math" label="Math expression" placeholder="%value%"/>
      <div class="text-grey-9" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
      <div class='q-my-md col-12' v-if="widget.topics.length > 1">
        <div class="text-grey-6" style="font-size: 0.75rem">Accumulate logic</div>
        <q-btn-toggle rounded toggle-text-color="grey-9" text-color="grey-6" flat v-model="currentSettings.accumulateLogic" :options="accumulateLogicOptions"/>
        <div class="text-grey-6" style="font-size: 0.75rem">How value will be accumulating*</div>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_MODE, COMMAND_MODE, ACCUMULATE_AND_MODE, ACCUMULATE_OR_MODE } from './constants.js'
import VariablesHelper from '../VariablesHelper'
export default {
  name: 'SwitcherSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      math: '',
      actionTopic: '',
      trueValue: '1',
      trueIcon: '',
      trueActionTopic: '',
      truePayload: '',
      falseValue: '0',
      falseIcon: '',
      falseActionTopic: '',
      falsePayload: '',
      accumulateLogic: ACCUMULATE_AND_MODE,
      save: true,
      mode: DEFAULT_MODE,
      height: 2,
      width: 2,
      minWidth: 1,
      minHeight: 2,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      modeOptions: [
        { label: 'Default mode', value: DEFAULT_MODE },
        { label: 'Command mode', value: COMMAND_MODE }
      ],
      accumulateLogicOptions: [
        { label: 'AND', value: ACCUMULATE_AND_MODE },
        { label: 'OR', value: ACCUMULATE_OR_MODE }
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
  },
  components: { VariablesHelper }
}
</script>
