<template>
  <q-modal v-model='status' @hide="closeHandler">
    <q-modal-layout>
      <q-toolbar slot="header" color='dark'>
        <q-toolbar-title>
          MQTT client
        </q-toolbar-title>
      </q-toolbar>
      <div style="margin: 20px;" :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh', width: $q.platform.is.mobile ? 'calc(100% - 40px)' : '50vw'}">
        <q-input color="dark"  v-model="currentSettings.clientName" float-label="MQTT client name" :error="!currentSettings.clientName"/>
        <q-input color="dark"  v-model="currentSettings.clientId" float-label="Client ID" :error="!currentSettings.clientId" :after="[{icon: 'mdi-refresh', handler () { currentSettings.clientId = `dasher-${Math.random().toString(16).substr(2, 8)}` }}]"/>
        <q-input color="dark"  v-model="currentSettings.host" float-label="Host" :error="!currentSettings.host || (currentSettings.host.indexOf('ws:') === 0)" :after="[{icon: 'mdi-alert-outline', handler: hostErrorHandler, error: true}]"/>
        <q-input color="dark"  v-model="currentSettings.keepalive" type="number" float-label="Keep alive"/>
        <q-select color="dark" v-model="currentSettings.protocolVersion" :options="[{label: '3.1.1', value: 4}, {label: '5.0', value: 5}]" float-label="Version of MQTT"/>
        <q-checkbox style="height: 56px" color="dark" class="q-mr-sm" v-model="currentSettings.clean" :label="currentSettings.protocolVersion === 5 ? 'Clean start' : 'Clean session'"/>
        <q-input style="display: inline-flex; width: calc(100% - 115px)" color="dark" v-if="currentSettings.protocolVersion === 5" v-model="currentSettings.properties.sessionExpiryInterval" type="number" float-label="Session expiry interval"/>
        <q-input color="dark" v-model="currentSettings.username" float-label="Username"/>
        <q-input color="dark" v-model="currentSettings.password" float-label="Password"/>
      </div>
      <q-toolbar slot="footer" color='dark'>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<style>
</style>

<script>
import merge from 'lodash/merge'

export default {
  name: 'ClientSettings',
  props: ['value', 'settings'],
  data () {
    let defaultSettings = {
      clientName: 'New client',
      clientId: `dasher-${Math.random().toString(16).substr(2, 8)}`,
      host: 'wss://mqtt.flespi.io',
      keepalive: 60,
      protocolVersion: 5,
      clean: true,
      username: 'FlespiToken XXXXXXXXXXXXXXXXXXX',
      password: '',
      properties: {
        sessionExpiryInterval: undefined
      }
    }
    return {
      defaultSettings,
      currentSettings: this.settings ? merge({}, defaultSettings, this.settings) : merge({}, defaultSettings)
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.currentSettings.clientId &&
        (!!this.currentSettings.host && !(this.currentSettings.host.indexOf('ws:') === 0))
    },
    status () { return this.value }
  },
  methods: {
    saveSettingsHandler () {
      this.$emit('save', this.currentSettings)
      this.closeHandler()
      this.$nextTick(() => {
        this.defaultSettings.clientId = `dasher-${Math.random().toString(16).substr(2, 8)}`
        this.currentSettings = merge({}, this.defaultSettings)
      })
    },
    closeHandler () {
      this.$emit('input', false)
      this.$emit('hide')
    },
    hostErrorHandler () {
      this.$q.notify({
        message: 'Host must be not empty and only over secured sockets'
      })
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    }
  }
}
</script>
