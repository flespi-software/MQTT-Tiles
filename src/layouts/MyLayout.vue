<template>
  <q-layout view="hHh Lpr lFf">
    <client-settings
      v-model="clientSettingsOpened"
      :settings="currentSettings"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-layout-header>
      <q-toolbar color="dark">
        <q-btn flat rounded icon="mdi-menu" @click="leftDrawerOpen = !leftDrawerOpen" v-if="fullViewMode"/>
        <q-toolbar-title style="line-height: 36px;">
          <img src="statics/mqtttiles-logo.png" alt="MQTT Tiles" style="height: 30px; vertical-align: text-bottom;">
          MQTT Tiles
          <sup style="position: relative; font-size: .9rem; padding-left: 4px">{{version}}</sup>
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>
    <q-layout-drawer side="left" v-model="leftDrawerOpen" v-if="fullViewMode">
      <div class="connections__subheader q-px-md bg-dark" style="position: relative; height: 70px;">
        <span class="text-white" style="font-size: 1.4rem; line-height: 70px;">My connections</span>
        <q-btn fab-mini @click="openSettings" icon="mdi-plus" color="white" class="text-dark" style="position: absolute; bottom: -20px; right: 16px; z-index: 1;"/>
      </div>
      <q-list v-if="clientsIds.length" style="position: absolute; top: 70px; bottom: 0; right: 0; left: 0;" class="scroll">
        <q-list-header>
          <span>Connections</span>
        </q-list-header>
        <q-item class="cursor-pointer" :class="{'active': index === activeClientId}" @click.native="setActiveClient(index)" v-for="(client, index) in clients" :key="index">
          <q-item-side>
            <q-icon :name="connected ? 'mdi-lan-connect' : 'mdi-lan-disconnect'">
              <q-tooltip v-if="index === activeClientId">{{`${connected ? 'Connected' : 'Disconnected'}`}}</q-tooltip>
            </q-icon>
          </q-item-side>
          <q-item-main>
            <q-item-tile label class="ellipsis" :class="{[`text-${connected ? 'green' : 'red'}-6`]: index === activeClientId}">
              {{client.clientName}}
            </q-item-tile>
            <q-item-tile sublabel class="ellipsis">{{client.host}}</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-btn round flat icon="mdi-dots-vertical" @click.stop="">
              <q-popover anchor="bottom right" self="top right">
                <q-list>
                  <q-item class="cursor-pointer" v-close-overlay highlight @click.native="editClientSettings(index)">
                    <q-item-side icon="mdi-settings" />
                    <q-item-main label="Edit"/>
                  </q-item>
                  <q-item-separator/>
                  <q-item class="cursor-pointer" v-close-overlay highlight @click.native="removeClient(index)">
                    <q-item-side color="red" icon="mdi-delete-outline" />
                    <q-item-main label="Remove"/>
                  </q-item>
                </q-list>
              </q-popover>
            </q-btn>
          </q-item-side>
        </q-item>
      </q-list>
      <div v-else class="q-px-md q-pt-lg text-center">
        <div class="text-bold">No connections</div>
        <div style="font-size: .8rem">Create a connection to visualize its data on boards</div>
      </div>
    </q-layout-drawer>
    <q-page-container>
      <router-view :client="clients[activeClientId]" @change:status="changeStatus" @share="shareHandler" />
    </q-page-container>
  </q-layout>
</template>

<script>
import clientSettings from '../components/ClientSettings'
import { LocalStorage } from 'quasar'
import debounce from 'lodash/debounce'
import Vue from 'vue'
import { Base64 } from 'js-base64'
import { CLIENTS_LOCAL_STORAGE_NAME, ACTIVE_CLIENT_LOCAL_STORAGE_NAME } from '../constants'
import {version} from '../../package.json'
import { defaultClient } from '../constants/defaultes.js'

let saveClientsToLocalStorage = debounce((clients) => {
  LocalStorage.set(CLIENTS_LOCAL_STORAGE_NAME, clients)
}, 500, { trailing: true })

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      clientSettingsOpened: false,
      currentSettings: undefined,
      clients: {},
      activeClientId: undefined,
      editedClientId: undefined,
      connected: false,
      version,
      fullViewMode: true
    }
  },
  computed: {
    clientsIds () { return Object.keys(this.clients) }
  },
  methods: {
    openSettings () {
      this.clientSettingsOpened = true
    },
    hideSettingsHandler () {
      this.currentSettings = undefined
      this.editedClientId = undefined
    },
    saveSettingsHandler (settings) {
      let key = this.editedClientId ? this.editedClientId : this.clientsIds.length ? parseInt(this.clientsIds[this.clientsIds.length - 1]) + 1 : 0
      Vue.set(this.clients, key, settings)
    },
    editClientSettings (clientId) {
      this.currentSettings = this.clients[clientId]
      this.editedClientId = clientId
      this.openSettings()
    },
    removeClient (clientId) {
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete ${this.clients[clientId].clientName} client?`,
        color: 'dark',
        ok: true,
        cancel: true
      }).then(() => {
        if (this.activeClientId === clientId) { this.activeClientId = undefined }
        Vue.delete(this.clients, clientId)
      })
    },
    setActiveClient (clientId) {
      this.activeClientId = clientId
      LocalStorage.set(ACTIVE_CLIENT_LOCAL_STORAGE_NAME, clientId)
    },
    changeStatus (status) {
      this.connected = status
    },
    shareHandler (data) {
      let token = this.clients[this.activeClientId].username,
        topic = this.clients[this.activeClientId].syncNamespace,
        shareObj = { token, topic, boardId: data.boardId },
        link = `${window.location.href}${Base64.encode(JSON.stringify(shareObj))}`
      this.$q.notify({
        message: 'Link generated!',
        timeout: 0,
        type: 'info',
        icon: 'mdi-share',
        position: 'bottom-left',
        closeBtn: true,
        actions: [
          {
            label: 'Copy',
            handler: () => {
              this.$copyText(link)
                .then((e) => {
                  this.$q.notify({
                    type: 'positive',
                    icon: 'content_copy',
                    message: `Link copied`,
                    timeout: 1000,
                    position: 'bottom-left'
                  })
                }, (e) => {
                  this.$q.notify({
                    type: 'negative',
                    icon: 'content_copy',
                    message: `Error coping link`,
                    timeout: 1000,
                    position: 'bottom-left'
                  })
                })
            }
          }
        ]
      })
    }
  },
  created () {
    let shareData = this.$q.sessionStorage.get.item('mqtt-tiles-share')
    /* if follow by share link */
    if (this.$route.params.hash || shareData) {
      this.fullViewMode = false
      let client = defaultClient(),
        data
      if (this.$route.params.hash) {
        data = JSON.parse(Base64.decode(this.$route.params.hash))
      } else {
        data = shareData
      }
      this.$q.sessionStorage.set('mqtt-tiles-share', data)
      client.username = data.token
      client.syncNamespace = data.topic
      client.syncToRetain = true
      client.flespiBoard = data.boardId
      Vue.set(this.clients, 0, client)
      this.setActiveClient(0)
    } else {
      let savedClients = LocalStorage.get.item(CLIENTS_LOCAL_STORAGE_NAME)
      let activeClient = LocalStorage.get.item(ACTIVE_CLIENT_LOCAL_STORAGE_NAME)
      if (savedClients) {
        this.clients = savedClients
        if (this.$route.params.flespiToken) {
          let token = this.$route.params.flespiToken.replace('FlespiToken ', '')
          let clientIdsByFlespiToken = this.clientsIds.filter(clientId => {
            let clientToken = this.clients[clientId].username.replace('FlespiToken ', '')
            return token === clientToken
          })
          if (clientIdsByFlespiToken.length) {
            activeClient = clientIdsByFlespiToken[0]
          } else {
            let client = defaultClient()
            client.username = token
            let id = (parseInt(this.clientsIds[this.clientsIds.slice(-1)]) + 1).toString()
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
    }
  },
  components: { clientSettings }
}
</script>

<style>
</style>
