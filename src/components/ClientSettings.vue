<template>
  <q-dialog v-model='status' @hide="closeHandler" :maximized="$q.platform.is.mobile">
    <div :style="{width: $q.platform.is.mobile ? '100%' : '50vw'}">
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
          MQTT client
        </q-toolbar-title>
      </q-toolbar>
      <div :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh'}" class="q-pa-md scroll bg-white">
        <q-input color="grey-9 q-mb-sm" outlined hide-bottom-space v-model="currentSettings.clientName" label="MQTT client name" :error="!currentSettings.clientName"/>
        <q-input color="grey-9 q-mb-sm" outlined hide-bottom-space v-model="currentSettings.clientId" label="Client ID" :error="!currentSettings.clientId">
          <q-btn slot="append" flat dense icon="mdi-refresh" @click="currentSettings.clientId = `mqtt-tiles-${Math.random().toString(16).substr(2, 8)}`" />
        </q-input>
        <q-input color="grey-9 q-mb-sm" outlined hide-bottom-space v-model="currentSettings.host" label="Host" :error="!currentSettings.host || (currentSettings.host.indexOf('ws:') === 0)">
          <q-btn slot="append" flat dense icon="mdi-alert-outline" @click="hostErrorHandler" v-if="!currentSettings.host || (currentSettings.host.indexOf('ws:') === 0)"/>
        </q-input>
        <q-input color="grey-9 q-mb-sm" outlined hide-bottom-space type="number" v-model.number="currentSettings.keepalive" label="Keep alive"/>
        <q-select color="grey-9 q-mb-sm" outlined hide-bottom-space v-model="currentSettings.protocolVersion" emit-value map-options :options="[{label: '3.1.1', value: 4}, {label: '5.0', value: 5}]" label="Version of MQTT"/>
        <q-checkbox style="height: 56px" color="grey-9" class="q-mr-sm" v-model="currentSettings.clean" :label="currentSettings.protocolVersion === 5 ? 'Clean start' : 'Clean session'"/>
        <q-input outlined hide-bottom-space color="grey-9 q-mb-sm" v-if="currentSettings.protocolVersion === 5" v-model.number="currentSettings.properties.sessionExpiryInterval" type="number" label="Session expiry interval" clearable/>
        <q-input outlined hide-bottom-space color="grey-9 q-mb-sm" v-model="currentSettings.username" label="Username">
          <q-btn slot="append" flat dense icon="mdi-login" @click="flespiLoginHandler" v-if="currentSettings.host.indexOf('flespi') !== -1" />
        </q-input>
        <q-input color="grey-9 q-mb-sm" outlined hide-bottom-space v-model="currentSettings.password" label="Password"/>
        <q-expansion-item v-if="currentSettings.protocolVersion === 5" class="q-mt-md q-mb-sm bg-grey-4" label="Subscribe User Properties">
          <div>
            <q-list v-if="currentSettings.userProperties">
              <q-item v-for="(value, name) in currentSettings.userProperties" :key="`${name}: ${value}`">
                <q-icon class="q-mr-sm cursor-pointer" size='1rem' @click.native="removeUserProperty(name)" name="mdi-close-circle"/>
                <span>{{`${name}: ${value}`}}</span>
              </q-item>
            </q-list>
            <q-input color="grey-9 q-ma-sm" outlined hide-bottom-space v-model="userProperty.name" label="User property name"/>
            <q-input color="grey-9 q-mx-sm q-mb-sm" outlined hide-bottom-space v-model="userProperty.value" label="User property value"/>
            <q-btn :disable="!userProperty.name || !userProperty.value" style="width: 100%" class="q-mt-sm" color="grey-9" @click="addUserProperty">Add</q-btn>
          </div>
        </q-expansion-item>
        <div class="share-tokens__items-wrapper col-12 relative-position q-mt-lg q-mb-md" v-if="currentSettings.protocolVersion === 5 && currentSettings.host.indexOf('flespi.io') !== -1">
          <q-list bordered>
            <q-btn color="grey-9" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addSyncCredsItem" icon="mdi-plus"/>
            <q-item-label class="q-py-md q-px-sm">
              <div :class="{'text-red-6': !currentSettings.syncCreds || !currentSettings.syncCreds.length}">Tokens for sharing{{currentSettings.syncCreds && currentSettings.syncCreds.length ? '' : ' are empty'}}</div>
              <div style="font-size: .8rem;" class="text-grey-6 q-mt-xs">List of standard or ACL flespi tokens to be used for sharing boards.</div>
            </q-item-label>
            <q-expansion-item
              v-for="(syncCreds, index) in currentSettings.syncCreds"
              :key="`${index}`"
              group="singleselect-items"
              :header-class="[`bg-${checkUniqueSyncCredsValue(syncCreds, index) ? 'grey-4' : 'red-2'}`]"
              expand-icon="mdi-settings"
              default-opened
            >
              <template slot="header">
                <q-item-section avatar>
                  <div>
                    <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                    <q-btn :disabled="index === (currentSettings.syncCreds.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="ellipsis">{{syncCreds.label ? syncCreds.label : `Item ${index + 1}`}}</q-item-label>
                  <q-item-label class="text-grey-8 ellipsis" style="font-size: .8rem;">{{syncCreds.credentions.username || '*Empty*'}}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat color="red-6" round dense @click.stop="removeSyncCredsItem(index)" icon="mdi-delete"/>
                </q-item-section>
              </template>
              <div class="row">
                <div class="col-12 q-my-sm q-px-sm">
                  <q-input autofocus outlined hide-bottom-space color="grey-9" v-model="syncCreds.label" label="Label"/>
                </div>
                <div class="col-12 q-mb-sm q-px-sm">
                  <q-input outlined hide-bottom-space color="grey-9" v-model="syncCreds.credentions.username" label="Token" :error="!checkUniqueSyncCredsValue(syncCreds, index)"/>
                </div>
              </div>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
      </q-toolbar>
    </div>
  </q-dialog>
</template>

<style>
</style>

<script>
import merge from 'lodash/merge'
import { defaultClient } from '../constants/defaultes.js'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'ClientSettings',
  props: ['value', 'settings'],
  data () {
    let defaultSettings = defaultClient()
    return {
      defaultSettings,
      currentSettings: this.settings ? merge({}, defaultSettings, this.settings) : merge({}, defaultSettings),
      userProperty: {
        name: '',
        value: ''
      },
      syncCreds: {
        label: '',
        credentions: {
          username: ''
        }
      }
    }
  },
  computed: {
    validateCurrentSettings () {
      return !!this.currentSettings.clientId &&
        (!!this.currentSettings.host && !(this.currentSettings.host.indexOf('ws:') === 0)) &&
        (
          !this.currentSettings.syncCreds || !this.currentSettings.syncCreds.length ||
          (
            !!this.currentSettings.syncCreds && !!this.currentSettings.syncCreds.length &&
            this.currentSettings.syncCreds.reduce((isUniq, item, index, items) => {
              let token = item.credentions.username
              if (!isUniq[token]) { isUniq[token] = 0 }
              isUniq[token]++
              if (index === items.length - 1) {
                return Object.keys(isUniq).reduce((currentUniq, value) => {
                  if (!currentUniq) { return currentUniq }
                  return isUniq[value] === 1
                }, true)
              }
              return isUniq
            }, {})
          )
        )
    },
    status () { return this.value }
  },
  methods: {
    saveSettingsHandler () {
      this.$emit('save', this.currentSettings)
      this.closeHandler()
      this.$nextTick(() => {
        this.defaultSettings.clientId = `mqtt-tiles-${Math.random().toString(16).substr(2, 8)}`
        this.currentSettings = merge({}, this.defaultSettings)
      })
    },
    closeHandler () {
      this.$emit('input', false)
      this.$emit('hide')
    },
    hostErrorHandler () {
      this.$q.notify({
        color: 'warning',
        message: 'Host must be not empty and only over secured sockets'
      })
    },
    addUserProperty () {
      if (!this.currentSettings.userProperties) {
        this.$set(this.currentSettings, 'userProperties', {})
      }
      this.$set(this.currentSettings.userProperties, this.userProperty.name, this.userProperty.value)
      this.userProperty = {
        value: '',
        name: ''
      }
    },
    removeUserProperty (name) {
      this.$delete(this.currentSettings.userProperties, name)
      if (!Object.keys(this.currentSettings.userProperties).length) {
        this.$set(this.currentSettings, 'userProperties', null)
      }
    },
    flespiLoginHandler () {
      let tokenHandler = (event) => {
        if (typeof event.data === 'string' && ~event.data.indexOf('FlespiToken')) {
          this.currentSettings.username = event.data
          window.removeEventListener('message', tokenHandler)
        }
      }
      window.addEventListener('message', tokenHandler)
      this.openWindow(`https://flespi.io/login/#/providers`)
    },
    openWindow (url, title) {
      title = title || 'auth'
      let w = 500, h = 600
      let dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left
      let dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top

      let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
      let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

      let left = ((width / 2) - (w / 2)) + dualScreenLeft
      let top = ((height / 2) - (h / 2)) + dualScreenTop
      let newWindow = window.open(url, title, 'toolbar=no,location=no,status=yes,resizable=yes,scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left)

      // Puts focus on the newWindow
      if (window.focus) {
        newWindow.focus()
      }
    },
    addSyncCredsItem () {
      if (!this.currentSettings.syncCreds) { this.$set(this.currentSettings, 'syncCreds', []) }
      this.currentSettings.syncCreds.push(cloneDeep(this.syncCreds))
    },
    removeSyncCredsItem (itemIndex) {
      this.$delete(this.currentSettings.syncCreds, itemIndex)
    },
    upSyncCredsItem (itemIndex) {
      let movedItem = this.currentSettings.syncCreds.splice(itemIndex, 1)[0]
      this.currentSettings.syncCreds.splice(itemIndex - 1, 0, movedItem)
    },
    downSyncCredsItem (itemIndex) {
      let movedItem = this.currentSettings.syncCreds.splice(itemIndex, 1)[0]
      this.currentSettings.syncCreds.splice(itemIndex + 1, 0, movedItem)
    },
    checkUniqueSyncCredsValue (syncCreds, index) {
      let isUnique = true
      this.currentSettings.syncCreds.map(item => item.credentions.username).some((val, valIndex) => {
        let sameValue = val === syncCreds.credentions.username
        if (sameValue) { isUnique = valIndex === index }
        return sameValue
      })
      return isUnique
    }
  },
  watch: {
    settings (settings) {
      this.currentSettings = merge({}, this.defaultSettings, settings)
    }
  }
}
</script>
