<template>
  <q-card flat inline class="widget__map-route " style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`, `${blocked ? 'scroll' : ''}`, `${integration ? '' : 'absolute'}`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0px;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.7rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-menu anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Duplicate</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
              </div>
            </q-menu>
          </q-btn>
        </q-item-section>
      </transition>
    </q-item>
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: integration ? '' : contentHeight}">
      <div style="width: 100%; height: 100%;">
        <div style="width: 100%; height: 100%;">
          <iframe style="width: 100%;height: calc(100% - 18px);" src="https://flespi.io/mapview" frameborder="0" ref="map" allowfullscreen></iframe>
        </div>
      </div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus">
  .block-leave-to
    transition all .2s ease-in-out
    opacity 0
  .block-leave
    transition all .2s ease-in-out
    opacity 1
  .block-enter
    transition all .2s ease-in-out
    opacity 0
  .block-enter-to
    transition all .2s ease-in-out
    opacity 1
</style>

<script>
import {
  WIDGET_STATUS_DISABLED
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'MapRoute',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked', 'integration'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      prevRoute: []
    }
  },
  computed: {
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 11px)'
      }
      return height
    }
  },
  methods: {
    setRoute (route) {
      this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView|cmd:{"addgroutes": ${JSON.stringify(route)}, "clear": "all", "fullscreencontrol": true}`, '*')
      this.prevRoute = route
    },
    getRoute () {
      let routeTopic = this.integration ? this.item.dataTopics[0] : this.item.settings.topics[0]
      if (this.integration) {
        routeTopic = { ...routeTopic, payloadField: this.item.settings.routeField }
      }
      let value = this.getValueByTopic(this.value[routeTopic.topicFilter] && this.value[routeTopic.topicFilter].payload, routeTopic),
        values = []
      value = value === 'N/A' ? '' : value
      if (Array.isArray(value)) {
        values = value
      } else {
        values = [value]
      }
      return values
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === 'MapView|state:{"ready": true}') {
        this.setRoute(this.getRoute())
      }
    })
  },
  mixins: [getValueByTopic, timestamp],
  watch: {
    value: {
      deep: true,
      handler (value) {
        let route = this.getRoute()
        if (route.length !== this.prevRoute.length || this.prevRoute.some((el, index) => el !== route[index])) {
          this.setRoute(this.getRoute())
        }
      }
    },
    'item.settings.topics' () {
      this.setRoute(this.getRoute())
    }
  }
}
</script>
