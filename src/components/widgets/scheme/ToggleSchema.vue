<template>
  <div class="row">
    <topic class="col-12 q-mb-sm" v-model="current.topic" :board="board" :config="{ needSelectors: true }"/>
    <q-btn-toggle class='q-my-sm col-12' rounded toggle-text-color="grey-9" text-color="grey-6" flat v-model="current.settings.mode" :options="modeOptions"/>
    <div class="col-6 q-pr-sm">
      <typed-input class="q-mb-sm" v-model="current.settings.trueValue" :settings="{ label: 'True value' }"/>
      <q-input outlined dense hide-bottom-space class="q-mb-sm" color="grey-9" v-model="current.settings.trueIcon" label="True value icon">
        <q-icon slot="append" :name="`mdi-${current.settings.trueIcon || 'toggle-switch-outline'}`" size="1.5rem"/>
        <q-btn flat slot="after" :style="{backgroundColor: current.settings.trueColor}">
          <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
            <q-color
              v-model="current.settings.trueColor"
              format-model='hex'
            />
          </q-menu>
        </q-btn>
      </q-input>
      <div v-if="current.settings.mode === 1" class="q-mb-sm">
        <q-input outlined dense hide-bottom-space color="grey-9" v-model="current.settings.trueActionTopic" label="True action topic">
          <q-btn slot="after" icon="mdi-arrow-right" dense flat @click="current.settings.falseActionTopic = current.settings.trueActionTopic" v-if="!!current.settings.trueActionTopic"/>
        </q-input>
        <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => current.settings.trueActionTopic += variable"/>
      </div>
      <q-input outlined dense hide-bottom-space v-if="current.settings.mode === 1" color="grey-9" v-model="current.settings.truePayload" label="True action payload">
        <q-btn slot="after" icon="mdi-arrow-right" dense flat @click="current.settings.falsePayload = current.settings.truePayload" v-if="!!current.settings.truePayload" />
      </q-input>
    </div>
    <div class="col-6 q-pl-sm">
      <typed-input class="q-mb-sm" v-model="current.settings.falseValue" :settings="{ label: 'False value' }"/>
      <q-input outlined dense hide-bottom-space class="q-mb-sm" color="grey-9" v-model="current.settings.falseIcon" label="False value icon">
        <q-icon slot="append" :name="`mdi-${current.settings.falseIcon || 'toggle-switch-off-outline'}`" size="1.5rem"/>
        <q-btn flat slot="after" :style="{backgroundColor: current.settings.falseColor}">
          <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
            <q-color
              v-model="current.settings.falseColor"
              format-model='hex'
            />
          </q-menu>
        </q-btn>
      </q-input>
      <div v-if="current.settings.mode === 1" class="q-mb-sm">
        <q-input outlined dense hide-bottom-space color="grey-9" v-model="current.settings.falseActionTopic" label="False action topic"/>
        <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => current.settings.falseActionTopic += variable"/>
      </div>
      <q-input outlined dense hide-bottom-space v-if="current.settings.mode === 1" color="grey-9" v-model="current.settings.falsePayload" label="False action payload"/>
    </div>
    <q-input outlined dense hide-bottom-space class="col-12 q-mt-sm" color="grey-9" v-model="current.settings.math" label="Math expression" placeholder="%value%"/>
    <div class="text-grey-9" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
  </div>
</template>

<script>
import Topic from '../Topic'
import VariablesHelper from '../VariablesHelper'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
export default {
  props: ['settings', 'board'],
  data () {
    return {
      modeOptions: [
        { label: 'Default mode', value: 0 },
        { label: 'Command mode', value: 1 }
      ],
      current: cloneDeep(this.settings)
    }
  },
  watch: {
    current: {
      deep: true,
      handler () {
        this.$emit('update', this.current)
      }
    },
    settings: {
      deep: true,
      handler (settings) {
        this.current = merge(settings, this.current)
      }
    }
  },
  components: { Topic, VariablesHelper }
}
</script>
