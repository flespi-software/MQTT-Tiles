<template>
  <q-layout view="hHh Lpr lFf">
    <client-settings
      v-model="clientSettingsOpened"
      :settings="currentSettings"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-header v-if="fullViewMode">
      <q-toolbar :class="[`bg-${$theme}-9`]">
        <q-toolbar-title style="line-height: 36px;">
          <img src="mqtttiles-logo.png" alt="MQTT Tiles" style="height: 30px; vertical-align: text-bottom;">
          MQTT Tiles
          <sup style="position: relative; font-size: .9rem; padding-left: 4px">{{version}}</sup>
        </q-toolbar-title>
        <q-btn v-if="fullViewMode && !$integrationMode" flat :icon="connected ? 'mdi-lan-connect' : 'mdi-lan-disconnect'" :color="connected ? 'green' : 'red'">
          <div v-if="activeClientId" class="q-ml-sm">
            <div style="line-height: 0.8rem;">{{clients[activeClientId].clientName}}</div>
            <div :class="[`text-${connected ? 'green' : 'red'} text-overline`]" style="font-size: 0.6rem; line-height: 0.7rem;">{{connected ? 'Online' : 'Offline'}}</div>
            <div v-if="showping && pingtime" style="font-size: 0.6rem; line-height: 0.6rem;">Ping: {{pingtime}} ms.</div>
          </div>
          <div v-else class="q-ml-sm">Connect</div>
          <q-tooltip>Connections</q-tooltip>
          <q-menu :persistent="true" :offset="[0, 5]" @hide="isConnectionsOpened = false" @show="isConnectionsOpened = true">
            <div style="min-width: 300px;" :style="{minHeight: clientsIds.length ? '300px' : '200px'}">
              <div class="connections__subheader q-px-md" :class="[`bg-${$theme}-9`]" style="position: relative; height: 70px;">
                <span class="text-white" style="font-size: 1.4rem; line-height: 70px;">My connections</span>
                <q-btn fab-mini @click="openSettings" icon="mdi-plus" :color="`${$theme}-7`" class="text-white" style="position: absolute; bottom: -20px; right: 16px; z-index: 1;"/>
              </div>
              <q-list v-if="clientsIds.length" style="height:200px;" class="scroll" :class="[`bg-${$theme}-1`]">
                <q-item-label class="q-py-md q-pl-md text-grey-9">
                  <span>Connections</span>
                </q-item-label>
                <q-item clickable :active="index === activeClientId" @click="editClientSettings(index)" v-for="(client, index) in clients" :key="index">
                  <q-item-section avatar>
                    <q-btn @click.stop="setActiveClient()" color="green" v-if="connected && index === activeClientId" icon="mdi-lan-connect" dense flat>
                      <q-tooltip>Disconnect</q-tooltip>
                    </q-btn>
                    <q-btn v-else @click.stop="setActiveClient(index)" icon="mdi-lan-disconnect" :color="index === activeClientId ? 'red' : ''" dense flat>
                      <q-tooltip v-if="index === activeClientId">Active</q-tooltip>
                    </q-btn>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="{[`text-${connected ? 'green' : 'red'}-6`]: index === activeClientId}">
                      <div style="max-width: calc(100% - 25px); display: inline-flex;">
                        <div class="ellipsis">{{client.clientName}}</div>
                      </div>
                      <div style="display: inline-flex;">
                        <q-icon v-if="client.attachedBoards && client.attachedBoards.length" name="mdi-link-variant" flat dense size="15px" color="yellow-9" class="q-ml-xs">
                          <q-tooltip>
                            {{`Attached boards: ${client.attachedBoards.join(', ')}`}}
                          </q-tooltip>
                        </q-icon>
                      </div>
                    </q-item-label>
                    <q-item-label caption class="ellipsis">{{client.host}}</q-item-label>
                  </q-item-section>
                  <q-item-section side style="padding-left: 4px!important;">
                    <q-btn round flat dense icon="mdi-dots-vertical" @click.stop="">
                      <q-menu anchor="bottom right" self="top right">
                        <q-list :class="[`bg-${$theme}-1`]">
                          <q-item v-close-popup clickable :class="index === activeClientId ? 'text-red' : ''" @click="index === activeClientId ? setActiveClient() : setActiveClient(index)">
                            <q-item-section avatar>
                              <q-icon :name="index === activeClientId ? 'mdi-lan-disconnect' : 'mdi-lan-connect'" />
                            </q-item-section>
                            <q-item-section>{{ index === activeClientId ? 'Disconnect' : 'Connect' }}</q-item-section>
                          </q-item>
                          <q-separator/>
                          <q-item v-close-popup clickable @click="editClientSettings(index)">
                            <q-item-section avatar>
                              <q-icon name="mdi-cog" />
                            </q-item-section>
                            <q-item-section>Edit</q-item-section>
                          </q-item>
                          <q-separator/>
                          <q-item v-close-popup clickable @click="removeClient(index)">
                            <q-item-section avatar>
                              <q-icon name="mdi-delete-outline" color="red"/>
                            </q-item-section>
                            <q-item-section>Remove</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="q-px-md q-pt-lg text-center">
                <div class="text-bold">No connections</div>
                <div style="font-size: .8rem">Create a connection to visualize its data on boards</div>
              </div>
              <div class="bg-grey-4">
                <q-toggle label="Show ping" color="grey-9" class="q-ml-md" v-model="showping"/>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view
        :client="clients[activeClientId]"
        @change-status="changeStatus"
        @ping="ping"
        @share="shareHandler"
        @change:attach="changeAttachedBoards"
        @delete:boards="deleteBoardsHandler"
        @add:boards="addBoardsHandler"
        @update-client-settings="editClientSettings(activeClientId)"
      />
    </q-page-container>
  </q-layout>
</template>

<script>
import clientSettings from '../components/ClientSettings'
import { LocalStorage } from 'quasar'
import debounce from 'lodash/debounce'
import Vue from 'vue'
import { Base64 } from 'js-base64'
import { CLIENTS_LOCAL_STORAGE_NAME, ACTIVE_CLIENT_LOCAL_STORAGE_NAME, SHOW_PING_LOCAL_STORAGE_NAME } from '../constants'
import { version } from '../../package.json'
import { defaultClient } from '../constants/defaultes.js'
import SelectorsAsync from '../components/selectors/async'
import get from 'lodash/get'

const saveClientsToLocalStorage = debounce((clients) => {
  LocalStorage.set(CLIENTS_LOCAL_STORAGE_NAME, clients)
}, 500, { trailing: true })

export default {
  name: 'MyLayout',
  data () {
    return {
      showping: LocalStorage.getItem(SHOW_PING_LOCAL_STORAGE_NAME) || false,
      pingtime: 0,
      clientSettingsOpened: false,
      currentSettings: undefined,
      clients: {},
      activeClientId: undefined,
      editedClientId: undefined,
      connected: false,
      version,
      fullViewMode: true,
      isConnectionsOpened: false
    }
  },
  computed: {
    clientsIds () { return Object.keys(this.clients) }
  },
  methods: {
    reactivateClient() {
      let key = this.activeClientId
      this.setActiveClient()
      this.$nextTick(() => { this.setActiveClient(key) })
    },
    openSettings () {
      this.clientSettingsOpened = true
    },
    hideSettingsHandler () {
      this.currentSettings = undefined
      this.editedClientId = undefined
    },
    saveSettingsHandler (settings) {
      const key = this.editedClientId ? this.editedClientId : this.clientsIds.length
      Vue.set(this.clients, key, settings)
      this.setActiveClient(key)
    },
    editClientSettings (clientId) {
      this.currentSettings = this.clients[clientId]
      this.editedClientId = clientId
      this.openSettings()
    },
    removeClient (clientId) {
      this.$q.dialog({
        title: 'Delete client?',
        message: `Do you really want to delete «${this.clients[clientId].clientName}» client?`,
        color: 'grey-9',
        ok: true,
        cancel: true
      }).onOk(() => {
        if (this.activeClientId === clientId) { this.activeClientId = undefined }
        Vue.delete(this.clients, clientId)
      })
    },
    setActiveClient (clientId) {
      if (typeof clientId === 'number') { clientId = String(clientId) }
      this.activeClientId = clientId
      LocalStorage.set(ACTIVE_CLIENT_LOCAL_STORAGE_NAME, clientId)
      if (clientId !== undefined) {
        this.setFlespiMode(clientId)
        this.makeFlespiRestBus(clientId)
      }
    },
    changeStatus (status) {
      this.connected = status
    },
    ping (ping) {
      this.pingtime = ping
    },
    shareHandler (data) {},
    clearAttachMode (client) {
      this.$q.notify({
        message: 'No boards attached to the connection. Showing all available boards.',
        timeout: 3000,
        color: 'info',
        icon: 'mdi-link-variant',
        position: 'bottom-left'
      })
      this.$delete(client, 'attachedBoards')
    },
    setFlespiMode (clientId) {
      const client = this.clients[clientId]
      if (client.host.indexOf('flespi') > -1) {
        Vue.prototype.$flespiMode = true
      } else {
        Vue.prototype.$flespiMode = false
      }
    },
    makeFlespiRestBus (clientId) {
      const client = this.clients[clientId]
      const selectorsAsync = new SelectorsAsync({ flespiApp: `mqtt-tiles(client: ${client.clientId})` })
      selectorsAsync.bus.auth.getRegions()
        .then((regions) => {
          regions = get(regions, 'data.result', [])
          const flespiClientRestRegion = regions.reduce((flespiRegion, region) => {
            const host = region['mqtt-ws'].split(':')[0]
            if (client.host.indexOf(host) !== -1) {
              return region
            } else {
              return flespiRegion
            }
          })
          if (flespiClientRestRegion) {
            selectorsAsync.settings = { server: flespiClientRestRegion.rest }
            selectorsAsync.token = client.username
            Vue.prototype.$flespiRestBus = selectorsAsync
          } else {
            Vue.prototype.$flespiRestBus = null
          }
        })
    },
    changeAttachedBoards (attachedBoardsIds) {
      if (attachedBoardsIds.length) {
        this.$set(this.clients[this.activeClientId], 'attachedBoards', [...attachedBoardsIds])
      } else if (this.clients[this.activeClientId].attachedBoards) {
        this.clearAttachMode(this.clients[this.activeClientId])
      }
    },
    deleteBoardsHandler (boardsIds) {
      Object.keys(this.clients).forEach(clientId => {
        if (this.clients[clientId].attachedBoards) {
          this.clients[clientId].attachedBoards.forEach((attachedBoardId, index) => {
            if (boardsIds.includes(attachedBoardId)) {
              this.$delete(this.clients[clientId].attachedBoards, index)
            }
          })
          if (!this.clients[clientId].attachedBoards.length) {
            this.clearAttachMode(this.clients[clientId])
          }
        }
      })
    },
    addBoardsHandler (boardsIds) {
      if (!this.activeClientId) { return false }
      const client = this.clients[this.activeClientId],
        hasAttachedBoards = !!client.attachedBoards
      if (hasAttachedBoards) {
        this.$q.notify({
          message: 'Attach new board to the connection?',
          timeout: 0,
          color: 'info',
          icon: 'mdi-link-variant',
          position: 'bottom-left',
          closeBtn: 'Close',
          classes: 'text-white',
          actions: [
            {
              label: 'Attach',
              handler: () => {
                this.$set(this.clients[this.activeClientId], 'attachedBoards', [...this.clients[this.activeClientId].attachedBoards, ...boardsIds])
              }
            }
          ]
        })
      }
    },
    setTheme (theme = 'grey') {
      Vue.prototype.$theme = theme
    }
  },
  mounted () {
    this.$integrationBus.send('ready')
  },
  created () {
    const shareData = this.$q.sessionStorage.getItem('mqtt-tiles-share')
    Vue.prototype.$flespiMode = false
    Vue.prototype.$integrationMode = false
    this.setTheme('grey')
    this.$root.$on('new-share-token', (token) => {
      const client = this.clients[this.activeClientId]
      if (client) {
        if (!client.syncCreds) { client.syncCreds = [] }
        client.syncCreds.push(token)
      }
    })
    if (this.$route.path.indexOf('integration') > -1) {
      Vue.prototype.$integrationMode = true
      this.setTheme(this.$route.query.theme)
      this.$integrationBus.on('SetFlespiLogin', ({ token, region }) => {
        const client = defaultClient()
        client.host = `wss://${region['mqtt-ws']}`
        client.username = token
        this.$set(this.clients, 0, client)
        this.setActiveClient(0)
      })
      this.$integrationBus.on('SetTheme', (theme) => {
        this.setTheme(theme)
      })
    } else if (this.$route.params.hash || shareData) { /* if follow by share link */
      this.fullViewMode = false
      const client = defaultClient()
      let data
      if (this.$route.params.hash) {
        data = JSON.parse(Base64.decode(this.$route.params.hash))
      } else {
        data = shareData
      }
      this.$q.sessionStorage.set('mqtt-tiles-share', data)
      if (data.host) { client.host = data.host }
      client.username = data.token
      client.syncNamespace = data.topic
      client.syncToRetain = true
      client.flespiBoard = data.boardId
      Vue.set(this.clients, 0, client)
      this.setActiveClient(0)
    } else {
      const savedClients = LocalStorage.getItem(CLIENTS_LOCAL_STORAGE_NAME)
      let activeClient = LocalStorage.getItem(ACTIVE_CLIENT_LOCAL_STORAGE_NAME)
      if (savedClients) {
        this.clients = savedClients
        if (this.$route.params.flespiToken) {
          const token = this.$route.params.flespiToken.replace('FlespiToken ', '')
          const clientIdsByFlespiToken = this.clientsIds.filter(clientId => {
            const clientToken = this.clients[clientId].username.replace('FlespiToken ', '')
            return token === clientToken
          })
          if (clientIdsByFlespiToken.length) {
            activeClient = clientIdsByFlespiToken[0]
          } else {
            const client = defaultClient()
            client.username = token
            const id = (parseInt(this.clientsIds[this.clientsIds.slice(-1)]) + 1).toString()
            Vue.set(this.clients, id, client)
            activeClient = id
          }
          this.$router.push('/')
        }
        if (activeClient && this.clients[activeClient]) {
          this.$nextTick(() => { this.setActiveClient(activeClient) })
        }
      }
    }
  },
  watch: {
    clients: {
      deep: true,
      handler (clients) {
        this.fullViewMode && saveClientsToLocalStorage(clients)
      }
    },
    showping(val) {
      LocalStorage.set(SHOW_PING_LOCAL_STORAGE_NAME, val)
    }
  },
  components: { clientSettings }
}
</script>

<style>
</style>
